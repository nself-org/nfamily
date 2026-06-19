/**
 * Metro Configuration — ɳFamily (Expo managed workflow)
 *
 * Purpose: Resolve @nself/* workspace packages via local stubs when the
 *   nself-packages monorepo is not available (CI bundles, EAS standalone builds).
 *   In production EAS flows the stubs are sufficient for bundle validation;
 *   full functionality (i18n, observability) is provided at EAS build time via
 *   real packages once they are published to npm.
 *
 * @nself/i18n       → src/stubs/nself-i18n.js    (NselfI18nProvider, initializeI18next, RTL utils)
 * @nself/observability → src/stubs/nself-observability.js (initObservability, createLogger)
 *
 * All other @nself/* packages are resolved to nself-generic stub (empty object).
 *
 * Inputs:  none (static config)
 * Outputs: Metro resolver config extending Expo defaults
 * Constraints:
 *   - Must use getDefaultConfig from expo/metro-config (Expo SDK 53 requirement).
 *   - extraNodeModules paths must be absolute.
 *   - Do not mutate the default config object; spread or assign into it.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const stubsDir = path.resolve(__dirname, 'src/stubs');

config.resolver = config.resolver ?? {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  '@nself/i18n': path.join(stubsDir, 'nself-i18n.js'),
  '@nself/observability': path.join(stubsDir, 'nself-observability.js'),
  // Catch-all for any other @nself/* import that may be added later.
  // Note: Metro does not support glob keys here; add explicit entries as needed.
};

module.exports = config;
