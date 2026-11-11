// SPDX-License-Identifier: Apache-2.0

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { runningInIOS } from '@/utils/env';

export type TIOSQRScannerCommand = { sessionId: number } & (
  | { action: 'start' | 'stop' }
  | { action: 'layout'; x: number; y: number; width: number; height: number; viewportWidth: number; cornerRadius: number; scanRegionCenterY: number }
  | { action: 'focus'; x: number; y: number }
  | { action: 'torch'; enabled: boolean }
);
export type TIOSQRScannerReply = { hasFlash?: boolean; hasFocus?: boolean };
export type TIOSQRScannerEvent = { sessionId: number; data?: string; error?: string; torchOff?: boolean };

type TOptions = {
  onStart?: () => void;
  onResult: (value: string) => void;
  onError: (error: unknown) => void;
  scanRegionCenterY: number;
  stopOnResult: boolean;
};

let nextSessionId = 0;

export const useIOSQRScanner = (videoRef: RefObject<HTMLVideoElement>, options: TOptions) => {
  const { t } = useTranslation();
  const bridge = runningInIOS() ? window.webkit?.messageHandlers.qrScanner : undefined;
  const [initErrorMessage, setInitErrorMessage] = useState<string>();
  const [hasFlash, setHasFlash] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const session = useRef<number>();
  const callbacks = useRef(options);
  callbacks.current = options;
  const { scanRegionCenterY, stopOnResult } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (!bridge || !video) {
      return;
    }
    const sessionId = ++nextSessionId;
    session.current = sessionId;
    let disposed = false;
    let receivedResult = false;
    const reportError = (error: unknown) => {
      if (!disposed) {
        setInitErrorMessage(t('send.scanQRNoCameraMessage'));
        callbacks.current.onError(error);
      }
    };
    const onScan = (event: CustomEvent<TIOSQRScannerEvent>) => {
      if (event.detail.sessionId !== sessionId || disposed) {
        return;
      }
      if (event.detail.torchOff) {
        setIsFlashOn(false);
      }
      if (event.detail.error) {
        reportError(event.detail.error);
      }
      if (event.detail.data && !receivedResult) {
        if (stopOnResult) {
          receivedResult = true;
          bridge.postMessage({ action: 'stop', sessionId }).catch(reportError);
        }
        callbacks.current.onResult(event.detail.data);
      }
    };
    const updateLayout = () => {
      const { x, y, width, height } = video.getBoundingClientRect();
      bridge.postMessage({
        action: 'layout', sessionId, x, y, width, height,
        viewportWidth: window.innerWidth,
        cornerRadius: parseFloat(getComputedStyle(video.parentElement!).borderRadius) || 0,
        scanRegionCenterY,
      }).catch(reportError);
    };
    window.addEventListener('ios-qr-scanner', onScan);
    const observer = new ResizeObserver(updateLayout);
    observer.observe(video);
    window.addEventListener('resize', updateLayout);
    bridge.postMessage({ action: 'start', sessionId }).then(reply => {
      if (disposed) {
        return;
      }
      updateLayout();
      setHasFlash(reply.hasFlash ?? false);
      setHasFocus(reply.hasFocus ?? false);
      callbacks.current.onStart?.();
    }).catch(reportError);

    return () => {
      disposed = true;
      session.current = undefined;
      observer.disconnect();
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('ios-qr-scanner', onScan);
      bridge.postMessage({ action: 'stop', sessionId }).catch(console.error);
    };
  }, [bridge, videoRef, scanRegionCenterY, stopOnResult, t]);

  const focusAt = useCallback(async (x: number, y: number) => {
    const sessionId = session.current;
    if (!bridge || sessionId === undefined || !hasFocus) {
      return false;
    }
    try {
      await bridge.postMessage({ action: 'focus', sessionId, x, y });
      return session.current === sessionId;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [bridge, hasFocus]);

  const toggleFlash = useCallback(async () => {
    const sessionId = session.current;
    if (!bridge || sessionId === undefined) {
      return;
    }
    const enabled = !isFlashOn;
    try {
      await bridge.postMessage({ action: 'torch', sessionId, enabled });
      if (session.current === sessionId) {
        setIsFlashOn(enabled);
      }
    } catch (error) {
      console.error(error);
    }
  }, [bridge, isFlashOn]);

  return { native: Boolean(bridge), initErrorMessage, hasFlash, hasFocus, isFlashOn, focusAt, toggleFlash };
};
