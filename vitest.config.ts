import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(dirname, './'),
      'lib/ui': path.join(dirname, './lib/components/ui'),
      'lib/bizComp': path.join(dirname, './lib/components/biz'),
      'lib/hooks': path.join(dirname, './lib/hooks'),
      'lib/request': path.join(dirname, './lib/request'),
      'lib/serverStore': path.join(dirname, './lib/server-store'),
      'lib/services': path.join(dirname, './lib/services'),
      'lib/store': path.join(dirname, './lib/store'),
      'lib/utils': path.join(dirname, './lib/utils'),
      'db': path.join(dirname, './db'),
      'actions': path.join(dirname, './app/actions'),
      'react-renderer': path.join(dirname, './artifacts/react-renderer/src/index.ts'),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        '.storybook/**',
        'artifacts/**',
        '**/*.stories.*',
        '**/*.config.*',
        '**/dist/**',
        '**/build/**',
        '**/*.d.ts',
      ],
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.test.{ts,tsx}'],
          exclude: ['**/*.stories.*', 'node_modules/**/*'],
        },
      },
    ],
  },
});
