// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { IconButton } from './button';
import { Icon, TIconName } from './icon';
import styles from './controls.module.css';

type TOption<T extends string> = { value: T; label: string };

type TSegmentedProps<T extends string> = {
  options: TOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
  full?: boolean;
};

export const SegmentedControl = <T extends string>({
  options, value, onChange, label, size = 'md', full = false,
}: TSegmentedProps<T>) => (
  <div className={`${styles.segmented} ${styles[size]} ${full ? styles.full : ''}`} role="radiogroup" aria-label={label}>
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

type TTextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: TIconName;
  trailing?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  type?: 'text' | 'search';
  mono?: boolean;
};

export const TextField = ({
  label, value, onChange, placeholder, icon, trailing, helper, error, type = 'text', mono = false,
}: TTextFieldProps) => (
  <label className={styles.field}>
    {label && <span className={styles.fieldLabel}>{label}</span>}
    <span className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
      {icon && <Icon name={icon} size={18} className={styles.inputIcon} />}
      <input
        className={`${styles.input} ${mono ? styles.mono : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)} />
      {type === 'search' && value && (
        <IconButton icon="close" label="Clear search" size="sm" onClick={() => onChange('')} className={styles.clear} />
      )}
      {trailing}
    </span>
    {(error || helper) && <span className={error ? styles.errorText : styles.helper}>{error || helper}</span>}
  </label>
);

type TToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export const Toggle = ({ checked, onChange, label }: TToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    onClick={() => onChange(!checked)}>
    <span className={styles.knob} />
  </button>
);
