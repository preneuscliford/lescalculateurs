module.exports = {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
};
