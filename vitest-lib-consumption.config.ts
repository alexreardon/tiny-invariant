import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test-lib-consumption/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globalSetup: ['test-lib-consumption/global-setup-teardown.mts'],
    testTimeout: 30000,
    teardownTimeout: 30000,
  },
});
