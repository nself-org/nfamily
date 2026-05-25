/**
 * Purpose: Shared TypeScript types for nFamily.
 * Inputs:  none — type declarations only
 * Outputs: FamilyMember, Notification, UserProfile, AuthState types
 * Constraints: mirrors nSelf GraphQL schema (np_family_* tables).
 * SPORT: MASTER-TYPES.md
 */

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  serverUrl: string;
}

export interface FamilyMember {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  relationship: string;
  joinedAt: string;
}

export interface FamilyNotification {
  id: string;
  title: string;
  body: string;
  type: 'invite' | 'update' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  serverUrl: string;
  email: string;
  token: string | null;
  isAuthenticated: boolean;
}
