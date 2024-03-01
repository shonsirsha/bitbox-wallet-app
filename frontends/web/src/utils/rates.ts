/**
 * Copyright 2024 Shift Crypto AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function formatNumber(amount: number, maxDigits: number): string {
  let formatted = amount.toFixed(maxDigits);
  let position = formatted.indexOf('.') - 3;
  const start = formatted[0] === '-' ? 1 : 0;

  while (position > start) {
    formatted = formatted.slice(0, position) + '\'' + formatted.slice(position);
    position -= 3;
  }
  return formatted;
}

// new Intl.NumberFormat("en-US", {
//   style: "percent",
//   signDisplay: "exceptZero",
// }).format(0.55);