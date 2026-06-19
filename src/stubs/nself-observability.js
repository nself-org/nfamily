/**
 * Stub: @nself/observability — Metro bundler alias for CI/standalone builds.
 *
 * Purpose: The @nself/observability package is a local workspace package (not
 *   published to npm). This stub satisfies Metro module resolution when nfamily
 *   is built outside the nself-packages monorepo (CI, EAS). All exports are
 *   no-ops: the app renders without Sentry/OTel, which is acceptable for
 *   bundle validation builds.
 *
 * Constraints: Must be plain JS (not TypeScript). Must export the same surface
 *   as the real @nself/observability package used in _layout.tsx.
 */

'use strict';

// initObservability: no-op for CI bundles
function initObservability(_config) {
  // Sentry and OTel are not initialised in stub builds.
}

// createLogger: returns a levelled no-op logger
function createLogger(_config) {
  var noop = function() {};
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
  };
}

// PII scrubbing stubs
function scrubEvent(event) { return event; }
function scrubFields(obj) { return obj; }
var scrubPatterns = [];

module.exports = {
  initObservability: initObservability,
  createLogger: createLogger,
  scrubEvent: scrubEvent,
  scrubFields: scrubFields,
  scrubPatterns: scrubPatterns,
};
