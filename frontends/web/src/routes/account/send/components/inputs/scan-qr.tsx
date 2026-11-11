// SPDX-License-Identifier: Apache-2.0

import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useBackButton } from '@/hooks/backbutton';
import { useQRScanner } from '@/hooks/qrcodescanner';
import { CloseXWhite, FlashWhite, FlashYellow } from '@/components/icon';
import { SpinnerRingAnimated } from '@/components/spinner/SpinnerAnimation';
import { triggerHapticFeedback, triggerLongHapticFeedback } from '@/utils/transport-mobile';
import style from './scan-qr.module.css';

const ANIMATION_MS = 300;
const DEFAULT_SCAN_REGION_CENTER_Y = 0.5;
const FULLSCREEN_SCAN_REGION_CENTER_Y = 0.35;

type TRequestClose = (onClosed?: () => void) => void;
type TResetLastResult = () => void;

type TProps = {
  onResult: (result: string) => void | boolean | Promise<void | boolean>;
  onClose: () => void;
  instruction: string;
  fullscreen?: boolean;
  guideHidden?: boolean;
  children?: ReactNode | ((requestClose: TRequestClose, resetLastResult: TResetLastResult) => ReactNode);
};

export const ScanQR = ({
  onResult,
  onClose,
  instruction,
  fullscreen,
  guideHidden = false,
  children,
}: TProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanRegionCenterY = (
    fullscreen
      ? FULLSCREEN_SCAN_REGION_CENTER_Y
      : DEFAULT_SCAN_REGION_CENTER_Y
  );
  const [open, setOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const closingRef = useRef(false);
  const busyRef = useRef(false);
  const processedRef = useRef<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number }>();
  const focusRequest = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => {
      cancelAnimationFrame(raf);
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const requestClose = useCallback<TRequestClose>((onClosed = onClose) => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    setOpen(false);
    closeTimer.current = setTimeout(onClosed, ANIMATION_MS);
  }, [onClose]);

  useBackButton(() => {
    requestClose();
    return false;
  });

  const handleValue = useCallback(async (value: string) => {
    const text = value.trim();
    if (!text || busyRef.current || closingRef.current) {
      return;
    }
    if (text === processedRef.current) {
      return;
    }
    processedRef.current = text;
    busyRef.current = true;
    setProcessing(true);
    try {
      const accepted = await onResult(text);
      if (accepted === false) {
        busyRef.current = false;
        setProcessing(false);
        return;
      }
      triggerLongHapticFeedback();
      requestClose();
    } catch (error) {
      console.error(error);
      busyRef.current = false;
      setProcessing(false);
    }
  }, [onResult, requestClose]);

  const { native, initErrorMessage, hasFlash, hasFocus, isFlashOn, toggleFlash, focusAt } = useQRScanner(videoRef, {
    onStart: () => setCameraReady(true),
    onResult: handleValue,
    onError: err => console.error(err),
    scanRegionCenterY,
    stopOnResult: false,
  });

  useEffect(() => {
    if (native) {
      document.documentElement.classList.add(style.nativeCameraPage!);
      return () => document.documentElement.classList.remove(style.nativeCameraPage!);
    }
  }, [native]);

  useEffect(() => {
    if (!focusPoint) {
      return;
    }
    const timer = setTimeout(() => setFocusPoint(undefined), 1000);
    return () => clearTimeout(timer);
  }, [focusPoint]);

  const handleFocus = async (event: MouseEvent<HTMLVideoElement>) => {
    if (!native || !hasFocus || !cameraReady || busyRef.current || closingRef.current || guideHidden) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const request = ++focusRequest.current;
    if (await focusAt(x, y) && request === focusRequest.current && !closingRef.current) {
      setFocusPoint({ x, y });
    }
  };

  const handleToggleFlash = () => {
    triggerHapticFeedback();
    toggleFlash();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      requestClose();
    }
  };

  const resetLastResult = useCallback(() => {
    processedRef.current = null;
  }, []);

  const fullscreenClass = fullscreen ? style.fullscreen || '' : '';
  const content = typeof children === 'function' ? children(requestClose, resetLastResult) : children;

  const scanner = (
    <div
      className={`${style.backdrop || ''} ${open ? style.backdropOpen || '' : ''} ${fullscreenClass} ${native ? style.nativeCamera || '' : ''}`}
      onClick={handleBackdropClick}>
      <div
        className={`${style.container || ''} ${open ? style.containerOpen || '' : ''} ${fullscreenClass}`}
        style={{ '--scan-qr-focus-top': `${scanRegionCenterY * 100}%` }}>
        {!cameraReady && !initErrorMessage && (
          <div className={style.spinnerContainer}>
            <SpinnerRingAnimated />
          </div>
        )}

        <video
          className={style.video}
          ref={videoRef}
          onClick={native && hasFocus ? handleFocus : undefined}
          poster={native ? undefined : `data:image/svg+xml,${encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"/>'
          )}`}
        />

        {focusPoint && (
          <span
            className={style.focusPoint}
            style={{ left: `${focusPoint.x * 100}%`, top: `${focusPoint.y * 100}%` }}
            aria-hidden="true"
          />
        )}

        <div className={style.overlay}>
          <div className={`${style.focus || ''} ${guideHidden ? style.focusHidden || '' : ''}`}>
            <span className={`${style.corner || ''} ${style.topLeft || ''}`} />
            <span className={`${style.corner || ''} ${style.topRight || ''}`} />
            <span className={`${style.corner || ''} ${style.bottomLeft || ''}`} />
            <span className={`${style.corner || ''} ${style.bottomRight || ''}`} />
            <p className={style.instruction}>{instruction}</p>
          </div>
          {content && (
            <div className={style.contentSlot}>
              {content}
            </div>
          )}
        </div>

        <button
          type="button"
          className={style.closeButton}
          aria-label={t('generic.close')}
          onClick={() => requestClose()}
        >
          <CloseXWhite />
        </button>

        {hasFlash && (
          <div className={style.controls}>
            <button
              type="button"
              onClick={handleToggleFlash}
              aria-label={t('send.scanQRToggleFlash')}
              aria-pressed={isFlashOn}>
              {isFlashOn ? <FlashYellow /> : <FlashWhite />}
            </button>
          </div>
        )}

        {processing && (
          <div className={style.processingOverlay}>
            <SpinnerRingAnimated />
          </div>
        )}

        {initErrorMessage && (
          <div className={style.error}>
            <p>{initErrorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
  // The native preview sits beneath WKWebView; the portal leaves only scanner UI above it.
  return native ? createPortal(scanner, document.body) : scanner;
};
