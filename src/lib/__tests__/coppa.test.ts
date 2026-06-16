/**
 * Purpose: Unit tests for COPPA age gate utility.
 * Tests: age<13 blocked; age>=13 allowed; boundary (exactly 13); unparseable date blocked.
 * SPORT: MASTER-ROUTES.md
 */

import { checkCoppa, parseDobInput } from '../coppa';

describe('checkCoppa', () => {
  const makeIso = (yearsAgo: number): string => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsAgo);
    return d.toISOString().split('T')[0]!;
  };

  it('blocks users younger than 13', () => {
    const result = checkCoppa(makeIso(10));
    expect(result.blocked).toBe(true);
    expect(result.ageYears).toBe(10);
  });

  it('blocks users exactly 12', () => {
    const result = checkCoppa(makeIso(12));
    expect(result.blocked).toBe(true);
  });

  it('allows users exactly 13', () => {
    const result = checkCoppa(makeIso(13));
    expect(result.blocked).toBe(false);
    expect(result.ageYears).toBe(13);
  });

  it('allows users older than 13', () => {
    const result = checkCoppa(makeIso(30));
    expect(result.blocked).toBe(false);
  });

  it('blocks when date is unparseable', () => {
    const result = checkCoppa('not-a-date');
    expect(result.blocked).toBe(true);
  });
});

describe('parseDobInput', () => {
  it('parses YYYY-MM-DD', () => {
    expect(parseDobInput('2000-06-15')).toBe('2000-06-15');
  });

  it('parses MM/DD/YYYY', () => {
    expect(parseDobInput('06/15/2000')).toBe('2000-06-15');
  });

  it('returns null for garbage input', () => {
    expect(parseDobInput('not-a-date')).toBeNull();
    expect(parseDobInput('13/32/1990')).toBeNull();
  });
});
