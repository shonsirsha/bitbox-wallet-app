// SPDX-License-Identifier: Apache-2.0

import styles from './skeleton.module.css';

type TProps = {
  width?: number | string;
  height?: number | string;
  radius?: 's' | 'pill';
};

// Loading placeholder: `undefined` data renders this, never a spinner.
export const Skeleton = ({ width = '100%', height = 16, radius = 's' }: TProps) => (
  <span className={`${styles.skeleton} ${styles[radius]}`} style={{ width, height }} aria-hidden="true" />
);

export const SkeletonRows = ({ count = 4 }: { count?: number }) => (
  <div className={styles.rows} aria-busy="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={styles.row}>
        <Skeleton width={36} height={36} radius="pill" />
        <span className={styles.lines}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="24%" height={12} />
        </span>
        <Skeleton width={72} height={14} />
      </div>
    ))}
  </div>
);
