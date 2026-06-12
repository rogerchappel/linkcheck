import { defineConfig } from 'vitest/config';

export default defineConfig({
  css: {
    postcss: {},
  },
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'test/smoke.test.ts', 'src/fixtures/**'],
  },
});
