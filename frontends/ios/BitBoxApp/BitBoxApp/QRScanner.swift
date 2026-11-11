// SPDX-License-Identifier: Apache-2.0

import AVFoundation
import UIKit
import WebKit

private typealias ScannerReply = (Any?, String?) -> Void

// Own the capture session: WebKit's getUserMedia stream does not expose lens focus controls.
final class QRScannerBridge: NSObject, WKScriptMessageHandlerWithReply {
    weak var webView: WKWebView?
    private var scanner: QRScanner?

    deinit {
        scanner?.stop()
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.protocol == scheme,
              let body = message.body as? [String: Any],
              let sessionID = body["sessionId"] as? Int,
              let action = body["action"] as? String,
              let webView = webView else {
            replyHandler(nil, "Invalid scanner request")
            return
        }
        if action == "start" {
            scanner?.stop()
            let capture = QRScanner(sessionID: sessionID, webView: webView)
            scanner = capture
            capture.start(reply: replyHandler)
            return
        }
        guard let capture = scanner, capture.sessionID == sessionID else {
            // A closing scanner can finish after the next scanner has opened.
            replyHandler([:], nil)
            return
        }
        switch action {
        case "stop":
            capture.stop()
            scanner = nil
            replyHandler([:], nil)
        case "layout":
            capture.updateLayout(body)
            replyHandler([:], nil)
        case "focus":
            guard let x = body["x"] as? Double, let y = body["y"] as? Double,
                  x.isFinite, y.isFinite, (0...1).contains(x), (0...1).contains(y) else {
                replyHandler(nil, "Invalid focus point")
                return
            }
            capture.focus(at: CGPoint(x: x, y: y), reply: replyHandler)
        case "torch":
            capture.setTorch(body["enabled"] as? Bool ?? false, reply: replyHandler)
        default:
            replyHandler(nil, "Unknown scanner request")
        }
    }
}

private final class QRScanner: NSObject, AVCaptureMetadataOutputObjectsDelegate {
    let sessionID: Int
    private weak var webView: WKWebView?
    private let session = AVCaptureSession()
    private let output = AVCaptureMetadataOutput()
    // Serialize camera ownership when a scanner closes while another one opens.
    private static let captureQueue = DispatchQueue(label: "swiss.bitbox.qr-camera")
    private let queue = QRScanner.captureQueue
    private let preview = QRScannerPreview()
    private var device: AVCaptureDevice?
    // Capture state belongs to queue; view/lifetime state belongs to the main thread.
    private var captureActive = false
    private var stopped = false
    private var observers: [NSObjectProtocol] = []
    private var wasOpaque = true
    private var background: UIColor?
    private var scrollBackground: UIColor?
    private var scanRegionCenterY = 0.5

    init(sessionID: Int, webView: WKWebView) {
        self.sessionID = sessionID
        self.webView = webView
        super.init()
        wasOpaque = webView.isOpaque
        background = webView.backgroundColor
        scrollBackground = webView.scrollView.backgroundColor
        preview.isUserInteractionEnabled = false
        preview.backgroundColor = .black
        preview.layer.masksToBounds = true
        preview.captureLayer.videoGravity = .resizeAspectFill
        preview.captureLayer.session = session
        webView.insertSubview(preview, belowSubview: webView.scrollView)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
    }

    func start(reply: @escaping ScannerReply) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            configure(reply: reply)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted && !self.stopped {
                        self.configure(reply: reply)
                    } else {
                        reply(nil, "Camera permission denied or scanner closed")
                    }
                }
            }
        default:
            reply(nil, "Camera permission denied")
        }
    }

    private func configure(reply: @escaping ScannerReply) {
        observeLifecycle()
        queue.async {
            do {
                guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
                    throw ScannerError.unavailable
                }
                let input = try AVCaptureDeviceInput(device: camera)
                self.session.beginConfiguration()
                self.session.sessionPreset = .high
                guard self.session.canAddInput(input), self.session.canAddOutput(self.output) else {
                    self.session.commitConfiguration()
                    throw ScannerError.unavailable
                }
                self.session.addInput(input)
                self.session.addOutput(self.output)
                self.output.setMetadataObjectsDelegate(self, queue: .main)
                self.output.metadataObjectTypes = [.qr]
                self.session.commitConfiguration()
                self.device = camera
                try camera.lockForConfiguration()
                if camera.isFocusModeSupported(.continuousAutoFocus) {
                    camera.focusMode = .continuousAutoFocus
                }
                camera.unlockForConfiguration()
                self.captureActive = true
                self.session.startRunning()
                guard self.session.isRunning else { throw ScannerError.unavailable }
                DispatchQueue.main.async {
                    guard !self.stopped else {
                        reply(nil, "Scanner closed")
                        return
                    }
                    self.updateScanRegion()
                    reply([
                        "hasFlash": camera.hasTorch,
                        "hasFocus": camera.isFocusPointOfInterestSupported &&
                            (camera.isFocusModeSupported(.continuousAutoFocus) || camera.isFocusModeSupported(.autoFocus)),
                    ], nil)
                }
            } catch {
                DispatchQueue.main.async { reply(nil, error.localizedDescription) }
            }
        }
    }

    func updateLayout(_ body: [String: Any]) {
        guard let webView = webView,
              let x = body["x"] as? Double, let y = body["y"] as? Double,
              let width = body["width"] as? Double, let height = body["height"] as? Double,
              let viewportWidth = body["viewportWidth"] as? Double,
              let centerY = body["scanRegionCenterY"] as? Double,
              [x, y, width, height, viewportWidth, centerY].allSatisfy({ $0.isFinite }),
              width > 0, height > 0, viewportWidth > 0, (0...1).contains(centerY) else { return }
        let scale = webView.bounds.width / viewportWidth
        preview.frame = CGRect(x: x * scale, y: y * scale, width: width * scale, height: height * scale)
        let radius = body["cornerRadius"] as? Double ?? 0
        preview.layer.cornerRadius = radius.isFinite ? max(0, radius * scale) : 0
        scanRegionCenterY = centerY
        updateScanRegion()
    }

    private func updateScanRegion() {
        guard !stopped, preview.bounds.width > 0, preview.bounds.height > 0 else { return }
        if let connection = preview.captureLayer.connection, connection.isVideoOrientationSupported {
            switch webView?.window?.windowScene?.interfaceOrientation {
            case .landscapeLeft: connection.videoOrientation = .landscapeLeft
            case .landscapeRight: connection.videoOrientation = .landscapeRight
            case .portraitUpsideDown: connection.videoOrientation = .portraitUpsideDown
            default: connection.videoOrientation = .portrait
            }
        }
        let size = min(preview.bounds.width * 0.8, 320)
        let region = CGRect(x: (preview.bounds.width - size) / 2,
                            y: max(0, min(preview.bounds.height - size, preview.bounds.height * scanRegionCenterY - size / 2)),
                            width: size, height: size)
        let rect = preview.captureLayer.metadataOutputRectConverted(fromLayerRect: region)
        queue.async { self.output.rectOfInterest = rect }
    }

    func focus(at point: CGPoint, reply: @escaping ScannerReply) {
        let viewPoint = CGPoint(x: point.x * preview.bounds.width, y: point.y * preview.bounds.height)
        // AVFoundation accounts for orientation and the aspect-fill crop of the preview.
        let cameraPoint = preview.captureLayer.captureDevicePointConverted(fromLayerPoint: viewPoint)
        configureDevice(reply: reply) { camera in
            guard camera.isFocusPointOfInterestSupported else { throw ScannerError.unavailable }
            let mode: AVCaptureDevice.FocusMode = camera.isFocusModeSupported(.continuousAutoFocus) ? .continuousAutoFocus : .autoFocus
            guard camera.isFocusModeSupported(mode) else { throw ScannerError.unavailable }
            camera.focusPointOfInterest = cameraPoint
            camera.focusMode = mode
        }
    }

    func setTorch(_ enabled: Bool, reply: @escaping ScannerReply) {
        configureDevice(reply: reply) { camera in
            guard camera.hasTorch, camera.isTorchModeSupported(enabled ? .on : .off) else { throw ScannerError.unavailable }
            camera.torchMode = enabled ? .on : .off
        }
    }

    private func configureDevice(reply: @escaping ScannerReply, action: @escaping (AVCaptureDevice) throws -> Void) {
        queue.async {
            do {
                guard self.captureActive, self.session.isRunning, let camera = self.device else { throw ScannerError.unavailable }
                try camera.lockForConfiguration()
                defer { camera.unlockForConfiguration() }
                try action(camera)
                DispatchQueue.main.async { reply([:], nil) }
            } catch {
                DispatchQueue.main.async { reply(nil, error.localizedDescription) }
            }
        }
    }

    private func observeLifecycle() {
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main) { [weak self] _ in
            guard let self = self else { return }
            self.queue.async {
                if let camera = self.device, camera.hasTorch, (try? camera.lockForConfiguration()) != nil {
                    camera.torchMode = .off
                    camera.unlockForConfiguration()
                }
                self.session.stopRunning()
            }
            self.send(["torchOff": true])
        })
        observers.append(center.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in
            guard let self = self else { return }
            self.queue.async {
                if self.captureActive { self.session.startRunning() }
            }
        })
        observers.append(center.addObserver(forName: .AVCaptureSessionRuntimeError, object: session, queue: .main) { [weak self] notification in
            let error = notification.userInfo?[AVCaptureSessionErrorKey] as? Error
            self?.send(["error": error?.localizedDescription ?? "Camera capture failed"])
        })
    }

    func stop() {
        guard !stopped else { return }
        stopped = true
        observers.forEach(NotificationCenter.default.removeObserver)
        observers.removeAll()
        preview.removeFromSuperview()
        webView?.isOpaque = wasOpaque
        webView?.backgroundColor = background
        webView?.scrollView.backgroundColor = scrollBackground
        queue.async {
            self.captureActive = false
            self.session.stopRunning()
        }
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard let code = metadataObjects.compactMap({ $0 as? AVMetadataMachineReadableCodeObject }).first,
              let value = code.stringValue else { return }
        send(["data": value])
    }

    private func send(_ payload: [String: Any]) {
        guard !stopped else { return }
        var detail = payload
        detail["sessionId"] = sessionID
        guard let data = try? JSONSerialization.data(withJSONObject: detail),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('ios-qr-scanner', { detail: \(json) }));")
    }

    private enum ScannerError: Error { case unavailable }
}

private final class QRScannerPreview: UIView {
    override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
    var captureLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }
}
