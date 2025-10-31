import js from '@eslint/js';

import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export const commonIgnores = {
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/coverage',
    'game/**',
    'temp/**',
    'docs/**',
    'frontend/docs/**',
    'frontend/public/games/**',
    '**/cdk.out',
    '**/*.config.{js,ts,mjs}',
    '**/jest.setup.ts',
  ],
};

// Base configs to spread into arrays
export const baseConfigs = [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierConfig,
];

export const basePlugins = {
  prettier,
  import: importPlugin,
  'unused-imports': unusedImports,
};

export const baseRules = {
  'prettier/prettier': 'error',
  'import/no-default-export': 'error',
  'import/no-named-as-default': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  'import/no-unresolved': ['error', { ignore: ['\\?url', 'mixpanel-browser'] }],
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'warn',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-floating-promises': 'off',
};
