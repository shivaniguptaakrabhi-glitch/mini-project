const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",

  transform: {
    ...tsJestTransformCfg,
  },

  roots: ["<rootDir>/src"],

  testMatch: [
    "**/tests/**/*.test.ts"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],

  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ],

  clearMocks: true,
};