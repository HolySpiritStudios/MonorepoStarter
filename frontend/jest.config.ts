import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'app/src/.*/.*Slice\\.ts',
    'app/src/.*/.*SliceTypes\\.ts',
    'app/src/.*/utils/.*Util\\.ts',
    'app/src/.*/.*Types\\.ts',
  ],
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/docs/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: process.env.CI ? false : true,
  clearMocks: true,
  resetModules: true,
  resetMocks: true,
};

export default config;
