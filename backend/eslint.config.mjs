import jest from 'eslint-plugin-jest';
import globals from 'globals';

import { baseConfigs, basePlugins, baseRules, commonIgnores } from '../eslint.config.common.mjs';

export default [
  commonIgnores,
  ...baseConfigs,
  jest.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      ...basePlugins,
      jest,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
      jest: {
        version: '29.7.0',
      },
    },
    rules: {
      ...baseRules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
