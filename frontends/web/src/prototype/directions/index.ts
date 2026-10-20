// SPDX-License-Identifier: Apache-2.0

// Each direction is lazy-loaded from its own folder, so a broken or unfinished direction
// cannot take the other ones down.

import { lazy } from 'react';
import type { TDirectionKey } from '../context';
import type { TDirectionProps } from './types';

type TDirectionComponent = (props: TDirectionProps) => JSX.Element;

export const DIRECTIONS: Record<TDirectionKey, React.LazyExoticComponent<TDirectionComponent>> = {
  A: lazy(() => import('./a-quiet-swiss').then(module => ({ default: module.DirectionA }))),
  B: lazy(() => import('./b-vault').then(module => ({ default: module.DirectionB }))),
  C: lazy(() => import('./c-activity').then(module => ({ default: module.DirectionC }))),
  D: lazy(() => import('./d-workspace').then(module => ({ default: module.DirectionD }))),
  E: lazy(() => import('./e-calm-cards').then(module => ({ default: module.DirectionE }))),
};
