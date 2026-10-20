// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Icon, TIconName } from './icon';
import styles from './button.module.css';

type TButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: TIconName;
  full?: boolean;
  // A link (href) or an action (onClick).
  href?: string;
  onClick?: () => void;
  // Opens href outside the app (block explorer, support pages).
  external?: boolean;
};

export const Button = ({
  children, variant = 'secondary', size = 'md', icon, full = false, href, onClick, external = false,
}: TButtonProps) => {
  const className = `${styles.button} ${styles[variant]} ${styles[size]} ${full ? styles.full : ''}`;
  const content = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      <span>{children}</span>
    </>
  );
  if (href) {
    return (
      <a className={className} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </a>
    );
  }
  return <button type="button" className={className} onClick={onClick}>{content}</button>;
};

type TIconButtonProps = {
  icon: TIconName;
  label: string;
  // Shows the label under the button (action rows) instead of only to assistive tech.
  caption?: boolean;
  variant?: 'plain' | 'filled';
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
