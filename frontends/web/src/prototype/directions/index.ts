// SPDX-License-Identifier: Apache-2.0

import type { TDirectionKey } from '../context';
import { DirectionE } from './e-calm-cards';
import type { TDirectionProps } from './types';

export const DIRECTIONS: Record<TDirectionKey, (props: TDirectionProps) => JSX.Element> = {
  E: DirectionE,
};
