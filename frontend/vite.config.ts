import react from '@vitejs/plugin-react';

import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(() => {
  const envDir = path.resolve(__dirname, '..');

  return {
    envDir,
    server: {
      port: 3000,
      host: true,
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
  };
});
