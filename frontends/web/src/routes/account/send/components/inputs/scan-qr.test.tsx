// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useQRScanner } from '@/hooks/qrcodescanner';
import { ScanQR } from './scan-qr';

vi.mock('@/hooks/qrcodescanner', () => ({ useQRScanner: vi.fn() }));
vi.mock('@/hooks/backbutton', () => ({ useBackButton: vi.fn() }));
vi.mock('@/utils/transport-mobile', () => ({ triggerHapticFeedback: vi.fn(), triggerLongHapticFeedback: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const focusAt = vi.fn().mockResolvedValue(true);
const toggleFlash = vi.fn();
const renderScanner = (fullscreen = false) => {
  const onClose = vi.fn();
  const rendered = render(<ScanQR instruction="Scan a QR code" fullscreen={fullscreen} onResult={vi.fn()} onClose={onClose} />);
  act(() => vi.mocked(useQRScanner).mock.calls[0]![1].onStart?.());
  return { ...rendered, onClose };
};

describe('ScanQR tap to focus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(useQRScanner).mockReturnValue({
      native: true, initErrorMessage: undefined, hasFlash: true, hasFocus: true,
      isFlashOn: false, toggleFlash, focusAt,
    });
  });

  afterEach(() => vi.useRealTimers());

  // Both scanner layouts must normalize taps relative to the preview, including modal offsets.
  it.each([false, true])('maps a tap to the camera preview with fullscreen=%s', async fullscreen => {
    renderScanner(fullscreen);
    const preview = document.querySelector('video')!;
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({ left: 40, top: 100, width: 300, height: 600 } as DOMRect);
    await act(async () => fireEvent.click(preview, { clientX: 100, clientY: 520, detail: 1 }));
    expect(focusAt).toHaveBeenCalledExactlyOnceWith(0.2, 0.7);
  });

  // Tapping the existing preview must not introduce another button or a visible focus instruction.
  it('keeps only the existing close and flashlight buttons', () => {
    renderScanner(true);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'generic.close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'send.scanQRToggleFlash' })).toBeInTheDocument();
  });

  // Flash and close remain independent controls and must never trigger a camera-focus request.
  it('keeps flash and close taps out of the focus handler', () => {
    const { onClose } = renderScanner();
    fireEvent.click(screen.getByRole('button', { name: 'send.scanQRToggleFlash' }));
    expect(toggleFlash).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'generic.close' }));
    act(() => vi.advanceTimersByTime(300));
    expect(onClose).toHaveBeenCalledOnce();
    expect(focusAt).not.toHaveBeenCalled();
  });

  // Older iOS shells and other platforms must not send native focus requests when their preview is tapped.
  it('does not request native focus for the web scanner', () => {
    vi.mocked(useQRScanner).mockReturnValue({
      native: false, initErrorMessage: undefined, hasFlash: false, hasFocus: false,
      isFlashOn: false, toggleFlash, focusAt,
    });
    renderScanner();
    fireEvent.click(document.querySelector('video')!, { clientX: 100, clientY: 200 });
    expect(focusAt).not.toHaveBeenCalled();
  });
});
