// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): push channel of the mock backend (stands in for /api/events).

type TSocket = { onmessage: ((event: MessageEvent) => void) | null };

export const sockets = new Set<TSocket>();

export const pushEvent = (subject: string, object: unknown) => {
  const data = JSON.stringify({ subject, action: 'replace', object });
  sockets.forEach(socket => socket.onmessage?.(new MessageEvent('message', { data })));
};
