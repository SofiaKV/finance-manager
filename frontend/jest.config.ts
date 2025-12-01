const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          types: ['node', 'jest', '@testing-library/jest-dom'],
          moduleResolution: 'node',
        },
      },
    ],
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/**/*.test.{ts,tsx}',
    '<rootDir>/test/**/*.spec.{ts,tsx}',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  verbose: true,
};

export default config;
