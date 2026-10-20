// SPDX-License-Identifier: Apache-2.0

import { ReactNode, useEffect, useRef } from 'react';
import { IconButton } from './button';
import styles from './sheet.module.css';

type TProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  // On phones every presentation is a bottom sheet. From tablet up: centered dialog or side panel.
  presentation?: 'dialog' | 'panel';
};

export const Sheet = ({ open, onClose, title, children, footer, presentation = 'dialog' }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) {
    return null;
  }
  return (
    <div className={`${styles.layer} ${styles[presentation]}`}>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={styles.sheet} role="dialog" aria-modal="true" tabIndex={-1}>
        <span className={styles.grabber} aria-hidden="true" />
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <IconButton icon="close" label="Close" onClick={onClose} size="sm" variant="filled" />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
};
