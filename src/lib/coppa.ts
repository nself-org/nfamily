/**
 * Purpose: COPPA age-gate utility — checks if a date-of-birth indicates age < 13.
 * Inputs:  dateOfBirth (ISO date string YYYY-MM-DD)
 * Outputs: { blocked: boolean; ageYears: number }
 * Constraints: COPPA requires server-side enforcement too; this is a UI gate only.
 *   Age is computed at sign-up time in the local device timezone.
 * SPORT: MASTER-LIBS.md
 */

const COPPA_MIN_AGE = 13;

export interface CoppaCheckResult {
  blocked: boolean;
  ageYears: number;
}

/**
 * Check whether a user's date-of-birth is under COPPA minimum age.
 * @param dateOfBirth - ISO date string "YYYY-MM-DD"
 */
export function checkCoppa(dateOfBirth: string): CoppaCheckResult {
  const dob = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(dob.getTime())) {
    // Unparseable — block to be safe
    return { blocked: true, ageYears: 0 };
  }

  let ageYears = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    ageYears -= 1;
  }

  return {
    blocked: ageYears < COPPA_MIN_AGE,
    ageYears,
  };
}

/**
 * Parse a date string typed by user in MM/DD/YYYY or YYYY-MM-DD format.
 * Returns null if unparseable.
 */
export function parseDobInput(raw: string): string | null {
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : raw;
  }
  // Try MM/DD/YYYY
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const iso = `${m[3]}-${m[1]!.padStart(2, '0')}-${m[2]!.padStart(2, '0')}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : iso;
  }
  return null;
}
