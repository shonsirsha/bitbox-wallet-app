// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): a small floating panel anchored under its trigger (tablet and desktop).
// Closes on Escape and on a click outside the anchor area.

import { ReactNode, useEffect, useRef } from 'react';
import styles from './popover.module.css';

type TProps = {
  open: boolean;
  onClose: () => void;
  // The element the panel hangs under (e.g. the filter button).
  trigger: ReactNode;
  children: ReactNode;
  label: string;
  // Full-width anchor (the panel then spans the trigger row).
  block?: boolean;
};

export const Popover = ({ open, onClose, trigger, children, label, block = false }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  return (
    <div ref={ref} className={`${styles.anchor} ${block ? styles.block : ''}`}>
      {trigger}
      {open && (
        <div className={styles.panel} role="dialog" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
};
