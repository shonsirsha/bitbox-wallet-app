// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon, TIconName } from './icon';
import styles from './button.module.css';

type TCommon = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: TIconName;
  full?: boolean;
  disabled?: boolean;
  className?: string;
};

type TButtonProps = TCommon & {
  children: ReactNode;
  href?: string;
  // Opens href outside the app (block explorer, support pages).
  external?: boolean;
  onClick?: () => void;
};

const classesFor = ({ variant = 'primary', size = 'md', full, className = '' }: TCommon) => (
  `${styles.button} ${styles[variant]} ${styles[size]} ${full ? styles.full : ''} ${className}`
);

export const Button = ({ children, href, external = false, onClick, icon, disabled, ...rest }: TButtonProps) => {
  const content = (
    <>
      {icon && <Icon name={icon} size={rest.size === 'sm' ? 16 : 18} />}
      <span>{children}</span>
    </>
  );
  if (href && !disabled) {
    return (
      <a className={classesFor(rest)} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classesFor(rest)} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
};

type TIconButtonProps = {
  icon: TIconName;
  label: string;
  // Shows the label under the button (action rows) instead of only to assistive tech.
  caption?: boolean;
  variant?: 'plain' | 'filled' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

export const IconButton = ({
  icon, label, caption = false, variant = 'plain', size = 'md', href, onClick, active = false, className = '',
}: TIconButtonProps) => {
  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 16 : 20;
  const inner = (
    <>
      <span className={`${styles.iconShape} ${styles[`icon-${variant}`]} ${styles[`icon-${size}`]} ${active ? styles.iconActive : ''}`}>
        <Icon name={icon} size={iconSize} />
      </span>
      {caption && <span className={styles.caption}>{label}</span>}
    </>
  );
  const classes = `${styles.iconButton} ${caption ? styles.withCaption : ''} ${className}`;
  if (href) {
    return <a className={classes} href={href} aria-label={caption ? undefined : label} title={caption ? undefined : label}>{inner}</a>;
  }
  return (
    <button type="button" className={classes} onClick={onClick} aria-label={caption ? undefined : label} title={caption ? undefined : label} aria-pressed={active || undefined}>
      {inner}
    </button>
  );
};
