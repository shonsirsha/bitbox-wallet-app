// SPDX-License-Identifier: Apache-2.0

import { Button, Message, PageHeader } from '../kit';
import { href } from '../routing';
import styles from './patterns.module.css';

// Placeholder for screens of the next design round, shown inside the app frame.
export const ComingSoon = ({ title }: { title: string }) => (
  <div className={styles.comingSoon}>
    <PageHeader title={title} />
    <Message title="Coming in the next design round">
      This preview covers Portfolio, Accounts, the account screens and transaction details.
      {' '}{title} follows next.
    </Message>
    <div className={styles.comingSoonActions}>
      <Button href={href.portfolio}>Back to portfolio</Button>
      <Button variant="ghost" href={href.kit}>See the component kit</Button>
    </div>
  </div>
);
