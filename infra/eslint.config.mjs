import globals from 'globals';

import { baseConfigs, basePlugins, baseRules, commonIgnores } from '../eslint.config.common.mjs';

export default [
  {
    ignores: [...commonIgnores.ignores, 'functions/**/*.js'],
  },
  ...baseConfigs,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: basePlugins,
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: baseRules,
  },
];
