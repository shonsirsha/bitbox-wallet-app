// SPDX-License-Identifier: Apache-2.0

// The BitBox mark and the light BitBoxApp wordmark: the logo only sits on the dark sidebar (in
// both themes).
import mark from '@/assets/bitbox-logo-inverted.png';
import wordmark from '@/components/icon/assets/app-logo-inverted.svg';
import styles from './logo.module.css';

type TProps = {
  // Height of the wordmark (its box includes the descender of "pp"); the mark matches it.
  height?: number;
};

export const Logo = ({ height = 20 }: TProps) => (
  <span className={styles.logo} role="img" aria-label="BitBoxApp" style={{ gap: Math.round(height * .4) + 4 }}>
    <img src={mark} alt="" className={styles.mark} style={{ height }} />
    <img src={wordmark} alt="" style={{ height }} />
  </span>
);
