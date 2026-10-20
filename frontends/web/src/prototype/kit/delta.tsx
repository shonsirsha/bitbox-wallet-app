// SPDX-License-Identifier: Apache-2.0

import { usePrototype } from '../context';
import { Badge } from './badge';
import { formatPercent } from './format';

type TProps = {
  // Relative change, e.g. 0.2071 for +20.71%. null/undefined renders nothing.
  value: number | null | undefined;
};

// Performance change as a tinted pill: the text keeps full contrast, the arrow carries the colour.
export const Delta = ({ value }: TProps) => {
  const { locale } = usePrototype();
  if (value === null || value === undefined || !isFinite(value)) {
    return null;
  }
  const up = value >= 0;
  return (
    <Badge tone={up ? 'success' : 'danger'} icon={up ? 'arrowUp' : 'arrowDown'}>
      <span dir="ltr">{formatPercent(value, locale)}</span>
    </Badge>
  );
};
