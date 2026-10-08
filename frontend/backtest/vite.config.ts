import { defineConfig } from 'vite';
import path from 'path';

// Config for `vite-node` runs of the backtest. Not part of the app build.
export default defineConfig({
  root: path.resolve(__dirname, '..'),
  resolve: {
    alias: [
      { find: /^(\.{1,2}\/)+swissEph$/, replacement: path.resolve(__dirname, 'nodeSwissEph.ts') },
      { find: '@', replacement: path.resolve(__dirname, '../src') },
    ],
  },
  ssr: { noExternal: [] },
});
