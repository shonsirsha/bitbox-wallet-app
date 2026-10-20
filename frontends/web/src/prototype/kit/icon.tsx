// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): one consistent line-icon set (24px grid, 1.75 stroke, round joins).
// Only the icons the Calm cards screens use.

import type { ReactNode } from 'react';

const PATHS = {
  portfolio: <><path d="M4 4v16h16" /><path d="M8 15l3.5-4 3 2.5L20 8" /></>,
  accounts: <><path d="M12 3.5l8.5 4.5L12 12.5 3.5 8 12 3.5z" /><path d="M3.5 12.5L12 17l8.5-4.5" /><path d="M3.5 16.5L12 21l8.5-4.5" /></>,
  lightning: <path d="M13 2.5L4.5 13.5h6.5l-1 8 8.5-11h-6.5l1-8z" />,
  marketplace: <><path d="M5.5 8h13l-1 12h-11l-1-12z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" /></>,
  settings: <><path d="M4 7h9" /><path d="M17 7h3" /><circle cx="15" cy="7" r="2" /><path d="M4 12h3" /><path d="M11 12h9" /><circle cx="9" cy="12" r="2" /><path d="M4 17h11" /><path d="M19 17h1" /><circle cx="17" cy="17" r="2" /></>,
  send: <><path d="M7 17L17 7" /><path d="M8.5 7H17v8.5" /></>,
  receive: <><path d="M17 7L7 17" /><path d="M15.5 17H7V8.5" /></>,
  self: <><path d="M17 3l3.5 3.5L17 10" /><path d="M4 11.5V10a3.5 3.5 0 0 1 3.5-3.5h13" /><path d="M7 21l-3.5-3.5L7 14" /><path d="M20 12.5V14a3.5 3.5 0 0 1-3.5 3.5h-13" /></>,
  swap: <><path d="M7.5 4L4 7.5 7.5 11" /><path d="M4 7.5h14" /><path d="M16.5 13l3.5 3.5-3.5 3.5" /><path d="M20 16.5H6" /></>,
  buy: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8.5v7" /><path d="M8.5 12h7" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  back: <path d="M15 18l-6-6 6-6" />,
  chevron: <path d="M9.5 18l6-6-6-6" />,
  close: <><path d="M17.5 6.5l-11 11" /><path d="M6.5 6.5l11 11" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.3-4.3" /></>,
  eye: <><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.75" /></>,
  eyeOff: <><path d="M3.5 3.5l17 17" /><path d="M10.5 5.6c.5-.1 1-.1 1.5-.1 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.7" /><path d="M6.6 6.7C4 8.5 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.8 0 3.3-.5 4.6-1.2" /><path d="M10 10a2.75 2.75 0 0 0 3.9 3.9" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5.5 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v.5" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  failed: <><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.2l-5.6 5.6" /><path d="M9.2 9.2l5.6 5.6" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  device: <><rect x="2.5" y="8" width="15.5" height="8" rx="2" /><path d="M18 10.5h2.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H18" /><path d="M6.5 12h4" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><path d="M4 7.5V17a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5z" /><circle cx="16" cy="14" r="1" /></>,
  note: <><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></>,
  filter: <path d="M4 5.5h16l-6 7.5v5.5l-4-2V13L4 5.5z" />,
  arrowUp: <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="M18 13l-6 6-6-6" /></>,
} satisfies Record<string, ReactNode>;

export type TIconName = keyof typeof PATHS;

type TProps = {
  name: TIconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

export const Icon = ({ name, size = 20, strokeWidth = 1.75, className, title }: TProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
    focusable="false">
    {title && <title>{title}</title>}
    {PATHS[name]}
  </svg>
);
