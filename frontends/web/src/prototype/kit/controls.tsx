// SPDX-License-Identifier: Apache-2.0

import { useRef } from 'react';
import { IconButton } from './button';
import { Icon } from './icon';
import { useIndicator } from './indicator';
import styles from './controls.module.css';

type TOption<T extends string> = { value: T; label: string };

type TSegmentedProps<T extends string> = {
  options: TOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  full?: boolean;
};

export const SegmentedControl = <T extends string>({ options, value, onChange, label, full = false }: TSegmentedProps<T>) => {
  const ref = useRef<HTMLDivElement>(null);
  const { rect, ready } = useIndicator(ref, '[aria-checked="true"]', [value, options.length]);
  return (
    <div ref={ref} className={`${styles.segmented} ${full ? styles.full : ''}`} role="radiogroup" aria-label={label}>
      {rect && (
        <span
          className={`${styles.thumb} ${ready ? styles.thumbReady : ''}`}
          style={{ transform: `translateX(${rect.x}px)`, width: rect.width }}
          aria-hidden="true" />
      )}
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={`${styles.segment} ${option.value === value ? styles.segmentActive : ''}`}
          onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
};

type TSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  // collapsible: rests as a round search button and widens into the field while focused or
  // filled, up to --k-search-w. field: always open (the sidebar's account search).
  variant?: 'collapsible' | 'field';
};

// The search, with its own clear button.
export const SearchField = ({ value, onChange, placeholder, variant = 'collapsible' }: TSearchFieldProps) => (
  <label className={`${styles.search} ${styles[variant]} ${value ? styles.filled : ''}`}>
    <Icon name="search" size={18} className={styles.searchIcon} />
    <input
      className={styles.input}
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={event => onChange(event.target.value)} />
    {value && <IconButton icon="close" label="Clear search" size="sm" onClick={() => onChange('')} className={styles.clear} />}
  </label>
);
