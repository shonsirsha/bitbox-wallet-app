// SPDX-License-Identifier: Apache-2.0

import { Message, PageHeader } from '../kit';
import styles from './patterns.module.css';

// Placeholder for screens the prototype does not cover yet, shown inside the app frame.
export const ComingSoon = ({ title }: { title: string }) => (
  <div className={styles.comingSoon}>
    <PageHeader title={title} />
    <Message title="Hey there">
      Not available yet. This prototype only covers Portfolio, Accounts, individual account screens and tx details.
    </Message>
  </div>
);
