/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  moduleFileExtensions: ["js", "json", "ts"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$", 
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts"],
};
