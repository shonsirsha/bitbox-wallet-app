// SPDX-License-Identifier: Apache-2.0

import type { TPayload } from './utils/transport-common';
import type { TIOSQRScannerCommand, TIOSQRScannerEvent, TIOSQRScannerReply } from './hooks/ios-qr-scanner';
import 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

export declare global {
  interface WindowEventMap {
    'ios-qr-scanner': CustomEvent<TIOSQRScannerEvent>;
  }
  interface Window {
    qt?: { webChannelTransport: unknown };
    android?: {
      call: (queryID: number, query: string) => void;
      showExplorerLinkMenu?: (msg: { url: string; copy: string; open: string; openError: string }) => void;
    };
    onMobileCallResponse?: (queryID: number, response: unknown) => void;
    onMobilePushNotification?: (msg: TPayload) => void;
    runningOnIOS?: boolean;
    androidKeyboardVisible?: boolean;
    onKeyboardVisibilityChanged?: (visible: boolean) => void;
    // Called by Android when the back button is pressed.
    onBackButtonPressed?: () => boolean;
    webkit?: {
      messageHandlers: {
        qrScanner?: {
          postMessage: (msg: TIOSQRScannerCommand) => Promise<TIOSQRScannerReply>;
        };
        goCall: {
          postMessage: (msg: { queryID: number; query: string }) => void;
        };
        appReady: {
          postMessage: (msg: any) => void;
        };
        hapticFeedback: {
          postMessage: (msg: { style?: 'medium' | 'heavy' }) => void;
        };
        showExplorerLinkMenu?: {
          postMessage: (msg: { url: string; copy: string; open: string; cancel: string }) => void;
        };
      };
    };
  }
}
