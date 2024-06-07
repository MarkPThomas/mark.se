export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '!coverage/**/*',
    'src/**/*',
    '!**/index.ts',
    '!*.config.ts',
    '!*.json',
    '!**/**/**/*.d.ts',
    '!**/**/**/*.mock.ts',
    '!**/**/**/*config.ts',
    '!**/**/**/*ispecs.ts',
    '!**/**/**/*specs.ts',
    '!*.spec.ts',
  ],
  coverageThreshold: {
    "global": {
      "branches": 20,
      "functions": 30,
      "lines": 50,
      "statements": 50
    }
  },
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  // setupFiles: ['./setup-test-matchers.ts'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/**/?(*.)+(specs|spec).ts'
  ],
  transform: {
    '^.+\\ts?$': 'ts-jest'
  }
}