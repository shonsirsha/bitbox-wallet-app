// SPDX-License-Identifier: Apache-2.0

import { IconButton } from './button';
import { Icon, TIconName } from './icon';
import styles from './controls.module.css';

type TOption<T extends string> = { value: T; label: string };

type TSegmentedProps<T extends string> = {
  options: TOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  full?: boolean;
};

export const SegmentedControl = <T extends string>({ options, value, onChange, label, full = false }: TSegmentedProps<T>) => (
  <div className={`${styles.segmented} ${full ? styles.full : ''}`} role="radiogroup" aria-label={label}>
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
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: TIconName;
};

// A search field with its own clear button.
export const TextField = ({ value, onChange, placeholder, icon }: TTextFieldProps) => (
  <label className={styles.inputWrap}>
    {icon && <Icon name={icon} size={18} className={styles.inputIcon} />}
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
