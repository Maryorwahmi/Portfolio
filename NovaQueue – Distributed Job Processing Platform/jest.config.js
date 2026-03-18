/**
 * Jest Configuration
 * Created by CaptainCode
 */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/services'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/src/$1',
    '^@api/(.*)$': '<rootDir>/services/api/src/$1',
    '^@worker/(.*)$': '<rootDir>/services/worker/src/$1',
    '^@scheduler/(.*)$': '<rootDir>/services/scheduler/src/$1'
  },
  collectCoverageFrom: [
    'services/**/src/**/*.ts',
    '!services/**/src/**/*.d.ts',
    '!services/**/src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
