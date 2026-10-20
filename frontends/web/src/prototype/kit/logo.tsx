// SPDX-License-Identifier: Apache-2.0

import logoDark from '@/components/icon/assets/app-logo.svg';
import logoLight from '@/components/icon/assets/app-logo-inverted.svg';
import { usePrototype } from '../context';

type TProps = {
  height?: number;
  // Force the light wordmark (for dark panels inside a light theme).
  onDark?: boolean;
};

export const Logo = ({ height = 20, onDark = false }: TProps) => {
  const { theme } = usePrototype();
  return (
    <img
      src={theme === 'dark' || onDark ? logoLight : logoDark}
      alt="BitBoxApp"
      height={height}
      style={{ height, width: 'auto', display: 'block' }} />
  );
};
