// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): routes the frontend's backend traffic to the in-memory mock.
// The app talks to the backend through `fetch('http://localhost:8082/api/...')` and one
// WebSocket (`ws://localhost:8082/api/events`); both are intercepted here, so nothing in
// the app itself needs to change and nothing ever reaches a real backend.

import { handleGet, handlePost } from './backend';
import { sockets } from './events';

const API_PREFIX = /^https?:\/\/localhost:\d+\/api\//;
const EVENTS_URL = /\/api\/events$/;

const latency = () => new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 120));

const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!API_PREFIX.test(url)) {
    return realFetch(input, init);
  }
  const endpoint = url.replace(API_PREFIX, '');
  const method = (init?.method || 'GET').toUpperCase();
  let body: unknown;
  if (typeof init?.body === 'string' && init.body.length) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = init.body;
    }
  }
  await latency();
  const result = method === 'GET' ? handleGet(endpoint) : handlePost(endpoint, body);
  return new Response(JSON.stringify(result ?? null), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

type TListener = ((event: MessageEvent) => void) | null;

// Minimal socket that never closes (a close would mark the backend as disconnected).
class MockEventSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  readonly url: string;
  readyState = MockEventSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: TListener = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    sockets.add(this);
    setTimeout(() => {
      this.readyState = MockEventSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send() {
    // The frontend only sends its auth header; nothing to do.
  }

  close() {
    this.readyState = MockEventSocket.CLOSED;
    sockets.delete(this);
  }

  addEventListener() {}

  removeEventListener() {}
}

const RealWebSocket = window.WebSocket;

const PatchedWebSocket = function (this: unknown, url: string | URL, protocols?: string | string[]) {
  if (EVENTS_URL.test(String(url))) {
    return new MockEventSocket(String(url));
  }
  return new RealWebSocket(url, protocols);
} as unknown as typeof WebSocket;

Object.assign(PatchedWebSocket, {
  CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
  prototype: RealWebSocket.prototype,
});

window.WebSocket = PatchedWebSocket;
