/**
 * Purpose: ESLint config for nFamily RN/Expo (TypeScript).
 * Inputs:  src/**\/*.{ts,tsx}
 * Outputs: Lint pass/fail
 * Constraints: ESLint 8.x flat-compat style (.eslintrc.js). No-extends-expo kept
 *              minimal — CI only needs a working config, not full expo plugin set.
 * SPORT: CI green gate
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: false,
    node: true,
    es6: true,
  },
  rules: {
    // Allow `any` in scaffolding-phase code; tighten at v1.0.0
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused vars prefixed with _ (common in RN stubs)
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Allow require() for jest.mock/babel compat
    '@typescript-eslint/no-require-imports': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'android/',
    'ios/',
    'dist/',
    'babel.config.js',
  ],
};
