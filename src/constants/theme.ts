/**
 * Purpose: nSelf brand color tokens and theme constants.
 * Inputs:  none — static constants
 * Outputs: BrandColors object, ThemeColors object
 * Constraints: sky-500 (#0EA5E9) is primary per nSelf Design System UD-07.
 * SPORT: brand tokens migrated from lib/theme/brand_colors.dart
 */

export const BrandColors = {
  /** Primary brand color — sky-500 (#0EA5E9) */
  primary: '#0EA5E9',
  /** Dark background — gray-950 */
  background: '#030712',
  /** Surface — gray-900 */
  surface: '#111827',
  /** Text primary — white */
  textPrimary: '#F9FAFB',
  /** Text secondary — gray-400 */
  textSecondary: '#9CA3AF',
  /** Error — red-400 */
  error: '#F87171',
} as const;
