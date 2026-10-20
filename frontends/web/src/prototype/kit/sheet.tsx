// SPDX-License-Identifier: Apache-2.0

import { ReactNode, useEffect, useRef, useState } from 'react';
import { IconButton } from './button';
import styles from './sheet.module.css';

type TProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
};

// A bottom sheet on phones and a full-height side panel from tablet up.
const EXIT_MS = 220;

// The page behind an open sheet does not scroll; counted, so overlapping sheets unlock at the end.
let scrollLocks = 0;

const lockPageScroll = () => {
  const root = document.documentElement;
  if (scrollLocks === 0) {
    // The page scrollbar goes away while locked; its width becomes padding, so nothing shifts.
    root.style.setProperty('--k-lock-gutter', `${window.innerWidth - root.clientWidth}px`);
    root.classList.add('proto-scroll-lock');
  }
  scrollLocks += 1;
  return () => {
    scrollLocks -= 1;
    if (scrollLocks === 0) {
      root.classList.remove('proto-scroll-lock');
      root.style.removeProperty('--k-lock-gutter');
    }
  };
};

export const Sheet = ({ open, onClose, title, children }: TProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  // Content stays on screen while the sheet slides away (the caller may clear it on close).
  const lastContent = useRef<{ title?: ReactNode; children: ReactNode }>({ title, children });
  if (open) {
    lastContent.current = { title, children };
  }
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) {
      return;
    }
    setClosing(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => (open ? lockPageScroll() : undefined), [open]);
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
  if (!mounted) {
    return null;
  }
  return (
    <div className={`${styles.layer} ${closing ? styles.closing : ''}`}>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={styles.sheet} role="dialog" aria-modal="true" tabIndex={-1}>
        <span className={styles.grabber} aria-hidden="true" />
        {lastContent.current.title ? (
          <header className={styles.header}>
            <h2 className={styles.title}>{lastContent.current.title}</h2>
            <IconButton icon="close" label="Close" onClick={onClose} size="sm" variant="filled" />
          </header>
        ) : (
          // Without a title there is no header row: the close button sits in the corner.
          <IconButton icon="close" label="Close" onClick={onClose} size="sm" variant="filled" className={styles.floatingClose} />
        )}
        <div className={styles.body}>{lastContent.current.children}</div>
      </div>
    </div>
  );
};
