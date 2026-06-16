/**
 * Purpose: Shared TypeScript types for nFamily — covers all 9 bundle plugin surfaces.
 * Inputs:  none — type declarations only
 * Outputs: Domain types for family, geni, social, photos, chat, moderation, feed, realtime.
 * Constraints: mirrors nSelf GraphQL schema (np_family_* tables). Discriminated unions for errors.
 * SPORT: MASTER-TYPES.md
 */

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface AuthState {
  serverUrl: string;
  email: string;
  token: string | null;
  isAuthenticated: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  serverUrl: string;
  dateOfBirth?: string; // ISO date — used for COPPA check
  medicalConsentGiven?: boolean;
}

// ─────────────────────────────────────────────
// Family Tree (plugin: family, family-geni)
// ─────────────────────────────────────────────

export interface FamilyMember {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  relationship: string;
  joinedAt: string;
  dateOfBirth?: string;
  parentIds?: string[];
  childIds?: string[];
  spouseIds?: string[];
  geniPersonId?: string;    // set when imported from Geni.com
  medicalConsentGiven?: boolean;
}

export interface GeniImportJob {
  id: string;
  status: 'pending' | 'running' | 'done' | 'error';
  membersImported: number;
  photosImported: number;
  error?: string;
}

// ─────────────────────────────────────────────
// Social Feed (plugin: social)
// ─────────────────────────────────────────────

export type PostPrivacy = 'family_only' | 'extended_family';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  photoUrls: string[];
  privacy: PostPrivacy;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Photos (plugin: photos)
// ─────────────────────────────────────────────

export interface PhotoAlbum {
  id: string;
  title: string;
  coverUrl?: string;
  photoCount: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  taggedMemberIds: string[];
  takenAt?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Activity Feed (plugin: activity-feed)
// ─────────────────────────────────────────────

export type ActivityType =
  | 'post_created'
  | 'photo_uploaded'
  | 'member_joined'
  | 'birthday'
  | 'milestone';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Moderation (plugin: moderation)
// ─────────────────────────────────────────────

export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'other';
export type ModerationStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface ModerationReport {
  id: string;
  contentType: 'post' | 'comment' | 'photo';
  contentId: string;
  reporterId: string;
  reason: ReportReason;
  status: ModerationStatus;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Chat (plugin: chat)
// ─────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export interface FamilyNotification {
  id: string;
  title: string;
  body: string;
  type: 'invite' | 'update' | 'system' | 'chat' | 'like' | 'comment';
  read: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Offline queue entry
// ─────────────────────────────────────────────

export type OfflineOp =
  | { kind: 'createPost'; payload: { content: string; photoUris: string[]; privacy: PostPrivacy } }
  | { kind: 'uploadPhoto'; payload: { albumId: string; uri: string; caption?: string } };

export interface OfflineQueueEntry {
  id: string;
  op: OfflineOp;
  enqueuedAt: string;
  retryCount: number;
}

// ─────────────────────────────────────────────
// Error union (FamilyError)
// ─────────────────────────────────────────────

export type FamilyErrorType =
  | 'network'
  | 'auth'
  | 'geni_api'
  | 'upload_failed'
  | 'coppa_blocked'
  | 'rate_limit';

export interface FamilyError {
  type: FamilyErrorType;
  message: string;
  detail?: string;
}

// ─────────────────────────────────────────────
// Result helper
// ─────────────────────────────────────────────

export type Result<T, E = FamilyError> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err(error: FamilyError): Result<never> {
  return { ok: false, error };
}

// ─────────────────────────────────────────────
// 7-state screen helper
// ─────────────────────────────────────────────

export type ScreenState =
  | 'loading'
  | 'refreshing'
  | 'empty'
  | 'data'
  | 'error'
  | 'offline'
  | 'unauthorized';
