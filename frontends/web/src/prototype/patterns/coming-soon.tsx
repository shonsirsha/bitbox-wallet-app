// SPDX-License-Identifier: Apache-2.0

import { Button, Message, PageHeader } from '../kit';
import { href } from '../routing';
import styles from './patterns.module.css';

// Round-1 placeholder for screens that only the shortlisted directions get in round 2.
export const ComingSoon = ({ title }: { title: string }) => (
  <div className={styles.comingSoon}>
    <PageHeader title={title} />
    <Message tone="info" title="Designed in round 2">
      Round 1 covers the app frame, Portfolio, Accounts, Account and Transaction details.
      {' '}{title} gets designed for the two shortlisted directions.
    </Message>
    <div className={styles.comingSoonActions}>
      <Button variant="secondary" href={href.portfolio}>Back to portfolio</Button>
      <Button variant="ghost" href={href.kit}>See the component kit</Button>
    </div>
  </div>
);
