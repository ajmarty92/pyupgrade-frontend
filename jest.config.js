module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^js/(.*)$': '<rootDir>/js/$1'
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
