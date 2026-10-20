// SPDX-License-Identifier: Apache-2.0

import { Button, Message, PageHeader } from '../kit';
import { usePrototype } from '../context';
import { href } from '../routing';
import type { TDirectionProps } from './types';

export const Placeholder = (_props: TDirectionProps) => {
  const { direction } = usePrototype();
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader title={`Direction ${direction}`} subtitle="Prototype" />
      <Message tone="info" title="Being built right now">
        This direction is still being assembled. Use the switcher below to look at the others, or the current app.
      </Message>
      <div><Button variant="secondary" href={href.kit}>Open the component kit</Button></div>
    </div>
  );
};
