/**
 * Stub: @nself/i18n — Metro bundler alias for CI/standalone builds.
 *
 * Purpose: The @nself/i18n package is a local workspace package (not published to npm).
 *   This stub satisfies Metro module resolution when nfamily is built outside the
 *   nself-packages monorepo (CI, EAS). All exports are functional no-ops: the app
 *   renders without i18n, which is acceptable for bundle validation builds.
 *
 * In production EAS builds, EAS workflows should include the real @nself/i18n via
 *   the packages workspace or a published npm release.
 *
 * Constraints: Must be plain JS (not TypeScript) — Metro resolves this before any
 *   transpilation. Must export the same shape as the real @nself/i18n package.
 */

'use strict';

const React = require('react');

// Provider: renders children as-is (no i18n context needed for bundle validation)
function NselfI18nProvider(props) {
  return React.createElement(React.Fragment, null, props.children);
}

// Initialise i18next stub — no-op async
function initializeI18next(_locale) {
  return Promise.resolve();
}

// RTL utilities — pass-through stubs
function isRTL(_locale) { return false; }
function getTextAlign(_locale) { return 'left'; }
function getFlexDirection(_locale) { return 'row'; }
function getInsetDirection(_locale) { return 'left'; }
function getMarginDirection(_locale) { return 'marginLeft'; }

// Hijri/date formatting stubs
function formatHijriDate(_date, _locale) { return ''; }
function formatLocaleDate(_date, _locale) { return ''; }
function formatLocaleNumber(_n, _locale) { return String(_n); }

// useNselfTranslation hook stub
function useNselfTranslation() {
  return { t: function(key) { return key; }, i18n: {} };
}

// useTranslation stub (re-exported from react-i18next in real package)
function useTranslation() {
  return { t: function(key) { return key; }, i18n: {} };
}

module.exports = {
  NselfI18nProvider: NselfI18nProvider,
  initializeI18next: initializeI18next,
  isRTL: isRTL,
  isRTLUtil: isRTL,
  getTextAlign: getTextAlign,
  getTextAlignUtil: getTextAlign,
  getFlexDirection: getFlexDirection,
  getFlexDirectionUtil: getFlexDirection,
  getInsetDirection: getInsetDirection,
  getMarginDirection: getMarginDirection,
  formatHijriDate: formatHijriDate,
  formatLocaleDate: formatLocaleDate,
  formatLocaleNumber: formatLocaleNumber,
  useNselfTranslation: useNselfTranslation,
  useTranslation: useTranslation,
  RTL_LOCALES: new Set(['ar', 'he', 'fa', 'ur']),
};
