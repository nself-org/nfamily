/**
 * i18n Configuration — ɳFamily mobile (React Native + Expo)
 *
 * Purpose: Initialize i18next with locale detection via expo-localization and RTL support.
 *   Exports initializeI18n() for call at app root before any render.
 *   Exports getDeviceLocale() for use in NselfI18nProvider locale prop.
 *
 * Inputs: none (reads device locale via expo-localization)
 * Outputs: Initialized i18next instance; I18nManager.forceRTL set for Arabic
 * Constraints:
 *   - Must be called before rendering app root.
 *   - expo-localization is the locale detection mechanism per T-P3-E6-W1-S2-T02.
 *
 * SPORT: F12-REPO-TYPE-MAP.md (nfamily row)
 */

import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import { initializeI18next } from '@nself/i18n';

// ─── Supported locales ────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ['en', 'ar'] as const;
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// ─── Detect device locale ─────────────────────────────────────────────────────

/**
 * Detect the device locale via expo-localization.
 * expo-localization.getLocales() returns BCP-47 language tags.
 * Falls back to 'en' if detection fails or locale is unsupported.
 */
function detectLocale(): SupportedLocale {
  const locales = Localization.getLocales();
  const raw = locales[0]?.languageCode ?? 'en';
  const lang = raw.split(/[-_]/)[0]!.toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(lang)
    ? (lang as SupportedLocale)
    : 'en';
}

/**
 * Get device locale string via expo-localization (exported for layout provider use).
 */
export function getDeviceLocale(): string {
  return detectLocale();
}

// ─── Initialize i18n ──────────────────────────────────────────────────────────

/**
 * Initialize i18n for ɳFamily mobile.
 * - Detects device locale via expo-localization
 * - Enables RTL layout for Arabic/Hebrew/Farsi/Urdu via I18nManager.forceRTL
 * - Initializes i18next via @nself/i18n with the detected locale
 *
 * Must be called at module level in the root layout before any UI renders.
 * @param overrideLocale — optional override for testing or settings-driven locale
 */
export function initializeI18n(overrideLocale?: string): void {
  const locale = overrideLocale
    ? ((SUPPORTED_LOCALES as ReadonlyArray<string>).includes(overrideLocale)
        ? overrideLocale
        : 'en')
    : detectLocale();

  const isRtl = RTL_LOCALES.has(locale);

  // I18nManager.forceRTL flips the entire layout coordinate system for RTL locales.
  // Only call when the RTL state actually needs to change (idempotent guard).
  if (I18nManager.isRTL !== isRtl) {
    I18nManager.forceRTL(isRtl);
  }

  // Initialize i18next with the detected locale.
  initializeI18next(locale as 'en');
}

export { detectLocale };
