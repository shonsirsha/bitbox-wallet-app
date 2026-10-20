import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

// PROTOTYPE (throwaway): `npm run prototype` serves the UI-refresh prototypes on :8090.
// The entry is swapped for src/prototype/main.tsx, which installs an in-memory mock
// backend, so no Go backend is needed and nothing connects to :8082.
const prototypeEntry = () => ({
  name: 'bitbox-prototype-entry',
  // 'pre' so the build picks up the swapped entry, not only the dev server.
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replace('/src/index.tsx', '/src/prototype/main.tsx'),
  },
});

export default defineConfig((env) => {
  const envVars = loadEnv(env.mode, process.cwd(), '')
  const host = envVars.BITBOX_DEV_BIND_HOST || '127.0.0.1'
  const port = envVars.VITE_PORT
  const isPrototype = env.mode === 'prototype';
  return {
    // Separate dep-optimizer cache so the prototype server never fights the :8080 dev server.
    cacheDir: isPrototype ? 'node_modules/.vite-prototype' : undefined,
    // Relative base path so the js/css files are referenced with `./index-...js` instead of
    // `/index-...js`. This makes it easier to find these files in iOS.
    base: './',
    resolve: {
      // Select imports before bundling so each app ships only its supported video format.
      alias: envVars.BITBOX_APP_PLATFORM === 'ios' ? {
        '@/routes/device/bitbox02/components/password-entry/videos': fileURLToPath(
          new URL('./src/routes/device/bitbox02/components/password-entry/videos-ios.ts', import.meta.url)
        ),
      } : {},
    },
    build: {
      modulePreload: false,
      outDir: 'build',
      target: ['chrome122'],
    },
    plugins: [
      react(),
      checker({
        typescript: true,
        // Prototype directions are built in parallel; type errors go to the terminal only.
        ...(isPrototype ? { overlay: false } : {}),
      }),
      tsconfigPaths(),
      env.mode !== 'test' && !isPrototype && eslint(),
      isPrototype && prototypeEntry(),
    ],
    test: {
      css: false,
      environment: 'jsdom',
      globals: true,
      pool: 'forks',
      setupFiles: './vite.setup-tests.mjs',
      exclude: [
        ...configDefaults.exclude,
        'tests/**'
        ],
    },
    server: {
      host,
      port: typeof port !== 'undefined' ? port : 8080,
      strictPort: true,
      // node_modules is a symlink into the main checkout in the prototype worktree.
      fs: isPrototype ? { strict: false } : undefined,
    }
  };
});
