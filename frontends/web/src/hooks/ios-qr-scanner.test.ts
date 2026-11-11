// SPDX-License-Identifier: Apache-2.0

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TIOSQRScannerCommand, TIOSQRScannerEvent, TIOSQRScannerReply, useIOSQRScanner } from './ios-qr-scanner';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: translate }) }));
const translate = (key: string) => key;
const postMessage = vi.fn<(command: TIOSQRScannerCommand) => Promise<TIOSQRScannerReply>>();
const disconnect = vi.fn();
const options = () => ({ onStart: vi.fn(), onResult: vi.fn(), onError: vi.fn(), scanRegionCenterY: 0.35, stopOnResult: false });
const scan = (detail: TIOSQRScannerEvent) => {
  act(() => window.dispatchEvent(new CustomEvent('ios-qr-scanner', { detail })));
};
const activeSession = () => postMessage.mock.calls.find(([command]) => command.action === 'start')![0].sessionId;

describe('useIOSQRScanner', () => {
  let video: HTMLVideoElement;

  beforeEach(() => {
    vi.clearAllMocks();
    window.runningOnIOS = true;
    window.webkit = { messageHandlers: {
      qrScanner: { postMessage }, goCall: { postMessage: vi.fn() },
      appReady: { postMessage: vi.fn() }, hapticFeedback: { postMessage: vi.fn() },
    } };
    postMessage.mockResolvedValue({ hasFlash: true, hasFocus: true });
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      disconnect = disconnect;
    });
    video = document.createElement('video');
    const parent = document.createElement('div');
    parent.style.borderRadius = '16px';
    parent.appendChild(video);
    vi.spyOn(video, 'getBoundingClientRect').mockReturnValue({ x: 20, y: 30, width: 300, height: 500 } as DOMRect);
  });

  afterEach(() => {
    delete window.runningOnIOS;
    delete window.webkit;
    vi.unstubAllGlobals();
  });

  // All three consumers use this hook; native capture must not be selected without its iOS bridge.
  it('leaves the web scanner available on other platforms and older iOS shells', () => {
    delete window.runningOnIOS;
    const first = renderHook(() => useIOSQRScanner({ current: video }, options()));
    expect(first.result.current.native).toBe(false);
    first.unmount();
    window.runningOnIOS = true;
    delete window.webkit!.messageHandlers.qrScanner;
    const second = renderHook(() => useIOSQRScanner({ current: video }, options()));
    expect(second.result.current.native).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  // Preview bounds must reach native code so focus can account for the visible crop and orientation.
  it('starts capture, updates preview layout, and forwards only this session’s QR codes', async () => {
    const callbacks = options();
    const ref = { current: video };
    const { result, unmount } = renderHook(() => useIOSQRScanner(ref, callbacks));
    await waitFor(() => expect(result.current.hasFocus).toBe(true));
    const sessionId = activeSession();
    expect(callbacks.onStart).toHaveBeenCalledOnce();
    expect(postMessage).toHaveBeenCalledWith({
      action: 'layout', sessionId, x: 20, y: 30, width: 300, height: 500,
      viewportWidth: window.innerWidth, cornerRadius: 16, scanRegionCenterY: 0.35,
    });
    scan({ sessionId: sessionId - 1, data: 'stale' });
    scan({ sessionId, data: 'bitcoin:address' });
    expect(callbacks.onResult).toHaveBeenCalledExactlyOnceWith('bitcoin:address');
    unmount();
    expect(postMessage).toHaveBeenCalledWith({ action: 'stop', sessionId });
    expect(disconnect).toHaveBeenCalledOnce();
    scan({ sessionId, data: 'late' });
    expect(callbacks.onResult).toHaveBeenCalledOnce();
  });

  // Closing while permission/startup is pending releases the camera and ignores late startup completion.
  it('stops immediately when unmounted during camera startup', async () => {
    let finishStart!: (reply: TIOSQRScannerReply) => void;
    postMessage.mockImplementation(command => command.action === 'start'
      ? new Promise(resolve => {
        finishStart = resolve;
      })
      : Promise.resolve({}));
    const callbacks = options();
    const ref = { current: video };
    const { unmount } = renderHook(() => useIOSQRScanner(ref, callbacks));
    const sessionId = activeSession();
    unmount();
    expect(postMessage).toHaveBeenCalledWith({ action: 'stop', sessionId });
    await act(async () => finishStart({ hasFlash: true, hasFocus: true }));
    expect(callbacks.onStart).not.toHaveBeenCalled();
    expect(postMessage.mock.calls.some(([command]) => command.action === 'layout')).toBe(false);
  });

  // A focus marker must indicate a native focus request that succeeded, never a failed/no-op request.
  it('reports focus success only after the native bridge accepts it', async () => {
    const ref = { current: video };
    const { result } = renderHook(() => useIOSQRScanner(ref, options()));
    await waitFor(() => expect(result.current.hasFocus).toBe(true));
    await expect(result.current.focusAt(0.2, 0.7)).resolves.toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ action: 'focus', sessionId: activeSession(), x: 0.2, y: 0.7 });
    postMessage.mockRejectedValueOnce(new Error('camera unavailable'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(result.current.focusAt(0.5, 0.5)).resolves.toBe(false);
    log.mockRestore();
  });

  // Native camera errors are displayed through the existing scanner error UI and do not emit QR data.
  it('surfaces camera permission failures', async () => {
    postMessage.mockImplementation(command => command.action === 'start'
      ? Promise.reject(new Error('permission denied')) : Promise.resolve({}));
    const callbacks = options();
    const ref = { current: video };
    const { result } = renderHook(() => useIOSQRScanner(ref, callbacks));
    await waitFor(() => expect(result.current.initErrorMessage).toBe('send.scanQRNoCameraMessage'));
    expect(callbacks.onResult).not.toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalledOnce();
  });

  // Backgrounding switches off the physical torch, so the UI must reset to the same state.
  it('tracks torch changes and resets after camera suspension', async () => {
    const ref = { current: video };
    const { result } = renderHook(() => useIOSQRScanner(ref, options()));
    await waitFor(() => expect(result.current.hasFlash).toBe(true));
    await act(async () => result.current.toggleFlash());
    expect(result.current.isFlashOn).toBe(true);
    scan({ sessionId: activeSession(), torchOff: true });
    expect(result.current.isFlashOn).toBe(false);
  });
});
