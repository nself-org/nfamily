/**
 * Purpose: Unit tests for nFamily input validation schemas.
 * Tests: postCreate, albumCreate, memberInvite, geniConnect — valid + invalid inputs.
 * SPORT: MASTER-ROUTES.md
 */

import {
  validatePostCreate,
  validateAlbumCreate,
  validateMemberInvite,
  validateGeniConnect,
} from '../validation';

describe('validatePostCreate', () => {
  it('accepts valid post', () => {
    const r = validatePostCreate({ content: 'Hello family!', photoUris: [], privacy: 'family_only' });
    expect(r.success).toBe(true);
    expect(r.data?.content).toBe('Hello family!');
  });

  it('rejects empty content', () => {
    const r = validatePostCreate({ content: '', photoUris: [], privacy: 'family_only' });
    expect(r.success).toBe(false);
    expect(r.errors?.[0]?.field).toBe('content');
  });

  it('rejects content >2000 chars', () => {
    const r = validatePostCreate({ content: 'a'.repeat(2001), photoUris: [], privacy: 'family_only' });
    expect(r.success).toBe(false);
  });

  it('rejects more than 10 photos', () => {
    const r = validatePostCreate({
      content: 'Hi',
      photoUris: Array(11).fill('uri://x'),
      privacy: 'family_only',
    });
    expect(r.success).toBe(false);
    expect(r.errors?.[0]?.field).toBe('photoUris');
  });

  it('rejects invalid privacy value', () => {
    const r = validatePostCreate({ content: 'Hi', photoUris: [], privacy: 'public' });
    expect(r.success).toBe(false);
  });
});

describe('validateAlbumCreate', () => {
  it('accepts valid album name', () => {
    const r = validateAlbumCreate({ title: 'Summer 2026' });
    expect(r.success).toBe(true);
  });

  it('rejects empty title', () => {
    const r = validateAlbumCreate({ title: '' });
    expect(r.success).toBe(false);
  });

  it('rejects title >100 chars', () => {
    const r = validateAlbumCreate({ title: 'a'.repeat(101) });
    expect(r.success).toBe(false);
  });
});

describe('validateMemberInvite', () => {
  it('accepts valid email + relationship', () => {
    const r = validateMemberInvite({ email: 'alice@example.com', relationship: 'spouse' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = validateMemberInvite({ email: 'not-an-email', relationship: 'spouse' });
    expect(r.success).toBe(false);
    expect(r.errors?.[0]?.field).toBe('email');
  });

  it('rejects empty relationship', () => {
    const r = validateMemberInvite({ email: 'alice@example.com', relationship: '' });
    expect(r.success).toBe(false);
  });
});

describe('validateGeniConnect', () => {
  it('accepts valid OAuth code', () => {
    const r = validateGeniConnect({ oauthCode: 'abc123' });
    expect(r.success).toBe(true);
  });

  it('rejects empty OAuth code', () => {
    const r = validateGeniConnect({ oauthCode: '' });
    expect(r.success).toBe(false);
  });
});
