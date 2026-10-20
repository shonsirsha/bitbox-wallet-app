// SPDX-License-Identifier: Apache-2.0

// The light wordmark: the logo only sits on the dark sidebar (in both themes).
import logo from '@/components/icon/assets/app-logo-inverted.svg';

type TProps = {
  height?: number;
};

export const Logo = ({ height = 20 }: TProps) => (
  <img
    src={logo}
    alt="BitBoxApp"
    height={height}
    style={{ height, width: 'auto', display: 'block' }} />
);
