const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },

  roots: ['<rootDir>/src', '<rootDir>/test'],
};

export default config;
