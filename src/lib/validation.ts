/**
 * Purpose: Zod validation schemas for nFamily input forms.
 * Inputs:  raw form data objects
 * Outputs: Parsed, typed objects or ZodError
 * Constraints: All schemas enforce server constraints (length, format).
 *   postCreate: content ≤2000 chars, up to 10 photos.
 *   albumCreate: title required.
 *   memberInvite: valid email.
 *   geniConnect: non-empty OAuth token.
 * SPORT: MASTER-LIBS.md
 */

// Inline lightweight Zod-compatible validator without requiring the package
// (Zod not in current package.json — implement with equivalent runtime checks)

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// ─── postCreate ───────────────────────────────────────────────────────────────

export interface PostCreateInput {
  content: string;
  photoUris: string[];
  privacy: 'family_only' | 'extended_family';
}

export function validatePostCreate(raw: unknown): ValidationResult<PostCreateInput> {
  const errors: ValidationError[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { success: false, errors: [{ field: '_', message: 'Invalid input' }] };
  }
  const obj = raw as Record<string, unknown>;

  const content = obj['content'];
  if (typeof content !== 'string' || content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Post content is required.' });
  } else if (content.length > 2000) {
    errors.push({ field: 'content', message: 'Post content must be 2000 characters or fewer.' });
  }

  const photoUris = obj['photoUris'];
  if (!Array.isArray(photoUris)) {
    errors.push({ field: 'photoUris', message: 'Photo list must be an array.' });
  } else if (photoUris.length > 10) {
    errors.push({ field: 'photoUris', message: 'You can attach up to 10 photos per post.' });
  }

  const privacy = obj['privacy'];
  if (privacy !== 'family_only' && privacy !== 'extended_family') {
    errors.push({ field: 'privacy', message: 'Privacy must be family_only or extended_family.' });
  }

  if (errors.length > 0) return { success: false, errors };
  return {
    success: true,
    data: {
      content: (content as string).trim(),
      photoUris: photoUris as string[],
      privacy: privacy as PostCreateInput['privacy'],
    },
  };
}

// ─── albumCreate ─────────────────────────────────────────────────────────────

export interface AlbumCreateInput {
  title: string;
}

export function validateAlbumCreate(raw: unknown): ValidationResult<AlbumCreateInput> {
  const errors: ValidationError[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { success: false, errors: [{ field: '_', message: 'Invalid input' }] };
  }
  const obj = raw as Record<string, unknown>;
  const title = obj['title'];
  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Album title is required.' });
  } else if (title.length > 100) {
    errors.push({ field: 'title', message: 'Album title must be 100 characters or fewer.' });
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: { title: (title as string).trim() } };
}

// ─── memberInvite ────────────────────────────────────────────────────────────

export interface MemberInviteInput {
  email: string;
  relationship: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMemberInvite(raw: unknown): ValidationResult<MemberInviteInput> {
  const errors: ValidationError[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { success: false, errors: [{ field: '_', message: 'Invalid input' }] };
  }
  const obj = raw as Record<string, unknown>;

  const email = obj['email'];
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
  }

  const relationship = obj['relationship'];
  if (typeof relationship !== 'string' || relationship.trim().length === 0) {
    errors.push({ field: 'relationship', message: 'Relationship is required.' });
  }

  if (errors.length > 0) return { success: false, errors };
  return {
    success: true,
    data: { email: (email as string).trim(), relationship: (relationship as string).trim() },
  };
}

// ─── geniConnect ─────────────────────────────────────────────────────────────

export interface GeniConnectInput {
  oauthCode: string;
}

export function validateGeniConnect(raw: unknown): ValidationResult<GeniConnectInput> {
  const errors: ValidationError[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { success: false, errors: [{ field: '_', message: 'Invalid input' }] };
  }
  const obj = raw as Record<string, unknown>;
  const code = obj['oauthCode'];
  if (typeof code !== 'string' || code.trim().length === 0) {
    errors.push({ field: 'oauthCode', message: 'Geni OAuth code is required.' });
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: { oauthCode: (code as string).trim() } };
}
