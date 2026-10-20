// SPDX-License-Identifier: Apache-2.0

// PROTOTYPE (throwaway): entry for `npm run prototype` (port 8090). See ./README.md.
// The mock must be installed before any app module talks to the backend.
import './mock/install';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Router } from 'wouter';
import { useHashLocation } from '@/utils/router-compatability';
import { i18n } from '@/i18n/i18n';
import '@/style/index.css';
import './kit/tokens.css';
import { PrototypeApp } from './prototype-app';

if (import.meta.env.MODE !== 'prototype') {
  throw new Error('The prototype entry must only run in prototype mode.');
}

const rootEl = document.getElementById('root') as HTMLDivElement;

createRoot(rootEl).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <React.Suspense fallback={null}>
        <Router hook={useHashLocation}>
          <PrototypeApp />
        </Router>
      </React.Suspense>
    </I18nextProvider>
  </React.StrictMode>
);
