/**
 * Stryker Configuration for Mutation Testing
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'jest',
  testRunnerNodeArgs: ['--experimental-vm-modules'],
  jest: {
    configFile: 'jest.config.ts',
    enableFindRelatedTests: true,
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'src/lib/**/*.ts', // Focus on utility functions for faster mutation testing
    'src/services/**/*.ts', // API client
    '!src/**/*.d.ts',
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 40,
  },
  timeoutMS: 30000,
  concurrency: 2,
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },
  // Disable some mutators that produce too many equivalent mutants
  mutator: {
    excludedMutations: [
      'StringLiteral', // UI text changes don't affect logic
    ],
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'coverage',
    'reports',
    'playwright-report',
    'test-results',
    'e2e',
  ],
};
