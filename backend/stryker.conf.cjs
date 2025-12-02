/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    'src/budgets/**/*.ts',
    '!src/budgets/**/*.spec.ts',
    '!src/main.ts',
  ],

  testRunner: 'command',
  commandRunner: {
    command: 'pnpm test',
  },

  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'off',

  timeoutMS: 60000,
  concurrency: 1,
  maxConcurrentTestRunners: 1,
};
