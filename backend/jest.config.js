export default {
  testEnvironment: "node",

  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  collectCoverage: true,

  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js"
  ],

  transform: {},

  testMatch: [
    "**/tests/**/*.test.js"
  ]
};