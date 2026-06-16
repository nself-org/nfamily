/**
 * Purpose: FamilyError factory — map raw errors to typed FamilyError discriminated union.
 * Inputs:  raw error (unknown), optional hint for error type
 * Outputs: FamilyError with user-readable message
 * Constraints: All 6 error variants covered. Never expose raw stack traces to UI.
 * SPORT: MASTER-LIBS.md
 */

import type { FamilyError, FamilyErrorType } from '../types';

const USER_MESSAGES: Record<FamilyErrorType, string> = {
  network: 'No connection — check your internet and try again.',
  auth: 'Session expired — please sign in again.',
  geni_api: 'Geni.com import failed — check your Geni connection and try again.',
  upload_failed: 'Upload failed — please try again.',
  coppa_blocked: 'Children under 13 cannot create standalone accounts. Ask a parent to create your account.',
  rate_limit: 'Too many requests — please wait a moment and try again.',
};

/**
 * Classify a raw error into a FamilyError.
 */
export function toFamilyError(
  raw: unknown,
  hint?: FamilyErrorType
): FamilyError {
  const type: FamilyErrorType = hint ?? classifyError(raw);
  const message = USER_MESSAGES[type];
  const detail = raw instanceof Error ? raw.message : String(raw);
  return { type, message, detail };
}

function classifyError(raw: unknown): FamilyErrorType {
  if (raw instanceof Error) {
    const msg = raw.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) {
      return 'network';
    }
    if (msg.includes('jwt') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('401')) {
      return 'auth';
    }
    if (msg.includes('geni')) {
      return 'geni_api';
    }
    if (msg.includes('upload') || msg.includes('minio')) {
      return 'upload_failed';
    }
    if (msg.includes('rate') || msg.includes('429')) {
      return 'rate_limit';
    }
  }
  return 'network';
}

/**
 * Return a user-readable message for a FamilyError type.
 */
export function errorMessage(type: FamilyErrorType): string {
  return USER_MESSAGES[type];
}
