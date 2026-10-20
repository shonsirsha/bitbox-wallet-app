// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): rolling digits. Each digit is a column that slides to its new value like
// an odometer; separators and spaces stay static. Digits roll in from zero on first render,
// unless rollIn is off. Visual only (aria-hidden): the caller provides the accessible text.

import { useEffect, useState } from 'react';
import styles from './odometer.module.css';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const isDigit = (char: string | undefined) => !!char && char >= '0' && char <= '9';

type TProps = {
  text: string;
  // Roll in from zero when first shown (off: the digits appear as they are).
  rollIn?: boolean;
};

export const Odometer = ({ text, rollIn = true }: TProps) => {
  const [shown, setShown] = useState(() => (rollIn ? text.replace(/\d/g, '0') : text));
  useEffect(() => {
    // One frame later, so the columns are on screen at their previous digit and can roll.
    const frame = requestAnimationFrame(() => setShown(text));
    return () => cancelAnimationFrame(frame);
  }, [text]);
  const chars = text.split('');
  const shownChars = shown.split('');
  // Columns are matched from the right, so a value that gains a digit keeps its columns.
  const offset = shownChars.length - chars.length;
  return (
    <span className={styles.odometer} aria-hidden="true">
      {chars.map((char, i) => {
        const fromRight = chars.length - i;
        if (!isDigit(char)) {
          return <span key={`s${fromRight}`}>{char}</span>;
        }
        const previous = shownChars[i + offset];
        const digit = isDigit(previous) ? Number(previous) : 0;
        return (
          <span key={`d${fromRight}`} className={styles.column}>
            <span className={styles.ghost}>{char}</span>
            <span
              className={styles.strip}
              style={{ transform: `translateY(${-digit * 10}%)`, transitionDelay: `${i * 16}ms` }}>
              {DIGITS.map(value => <span key={value} className={styles.digit}>{value}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
};
