# ɳFamily — Feature Overview (v1.3.0)

All 9 bundle plugin UIs are implemented in the companion app (React Native / Expo 53).

---

## Bundle Plugins

| Plugin | Port | Status | UI Location |
|---|---|---|---|
| family | 3504 | ✅ Shipped | Family tab — tree + invite |
| family-geni | 3505 | ✅ Shipped | Family tab — Geni import |
| social | 3502 | ✅ Shipped | Feed tab — Posts |
| photos | — | ✅ Shipped | Photos tab — albums + upload |
| activity-feed | — | ✅ Shipped | Feed tab — Activity |
| moderation | — | ✅ Shipped | Profile tab → Moderation Queue |
| realtime | 3109 | ✅ Shipped | Feed (30s poll + subscription path) |
| cms | 3501 | ✅ Shipped | Profile tab (content management) |
| chat | 3401 | ✅ Shipped | Chat tab — family group chat |

---

## Feature Details

### Family Tree (plugin: family)

- Recursive tree component rendering ≥3 generations
- Root detection: members with no parents or parents outside the loaded set
- Tap member → MemberProfile (future detail view)
- Add Member button → InviteScreen
- 7-state screen: loading / refreshing / empty / data / error / offline / unauthorized
- Empty state: "Start your family tree — add your first member."

### Geni.com Import (plugin: family-geni)

- OAuth connect flow to Geni.com (deep-link or in-app WebView)
- Tree import via nSelf family-geni plugin (`/api/plugins/family-geni/connect`)
- Photos migrated to MinIO via signed URLs — no Geni URLs stored in DB (CR-C)
- Job polling with progress indicator (members imported, photos migrated)
- Cancel button during import
- Setup requires Geni API key in `Settings → Integrations`

### Social Feed (plugin: social)

- FeedList with cursor-based pagination (20 posts/page)
- PostCreate modal: text (≤2000 chars), up to 10 photos, privacy toggle (family_only | extended_family)
- Privacy enforced by Hasura RLS — not UI-only (CR-B)
- Optimistic like with rollback on error
- Comment count displayed; thread navigation (full thread view: future)
- Report post → ModerationReport inserted
- Offline: post queued to AsyncStorage offline queue; synced on reconnect

### Photos (plugin: photos)

- AlbumGrid — 2-column grid of PhotoAlbum cards
- Create album with validated title (≤100 chars)
- Multi-select photo upload via `expo-image-picker` (up to 10 photos, 20MB each)
- Upload path: request signed URL from nself-photos → PUT to MinIO → confirm
- Offline: uploads queued in offline queue
- FamilyTagging: future (tap face → select member)

### Activity Feed (plugin: activity-feed)

- Aggregated timeline of family activity (posts, photos, joins, birthdays, milestones)
- Timeline view with icon + actor name + action label
- 30-second polling as realtime subscription fallback
- 7-state screen

### Moderation Queue (plugin: moderation)

- Admin review of reported content (posts, comments, photos)
- Status: pending → actioned | dismissed
- Badge count of pending reports
- Report action requires confirmation Alert before removing content
- 7-state screen

### Realtime (plugin: realtime)

- Chat: 5-second polling for new messages
- Activity feed: 30-second polling
- Subscription path via Apollo Client WebSocket available when realtime plugin is active

### Chat (plugin: chat)

- Family group chat room (`family-group` room ID)
- Text messages + photo placeholder (photo sending: future)
- Optimistic message send with rollback on error
- Auto-scroll to latest message
- 7-state screen

---

## Cross-Cutting Features

### 7-State Screens

All 6 major data screens use `ScreenStateView` with the full 7-state model:

| State | Trigger |
|---|---|
| loading | Initial load with no cached data |
| refreshing | Pull-to-refresh in progress |
| empty | Loaded, zero items |
| data | Loaded, items present |
| error | Load failed, no data |
| offline | Device offline, no cached data |
| unauthorized | JWT expired or no access |

Screens: FeedList (social) · AlbumGrid (photos) · FamilyTree · ActivityFeed · ChatList · ModerationQueue

### COPPA Gate

- DOB collected during signup (step 2 of auth flow)
- `checkCoppa(dob)` blocks age < 13 with parent-creation prompt
- Medical consent toggle in Profile → Health & Privacy
- Consent stored in `np_family_members.medical_consent_given`

### Offline Sync

- Offline queue backed by AsyncStorage (MMKV-compatible)
- Operations: `createPost`, `uploadPhoto`
- Auto-flush on reconnect via `useOfflineSync` hook
- Max 100 entries; oldest evicted; max 3 retries per entry
- Offline banner shown when device is offline

### Typed Errors

`FamilyError` discriminated union with 6 variants:

| Type | User Message |
|---|---|
| network | No connection — check your internet and try again. |
| auth | Session expired — please sign in again. |
| geni_api | Geni.com import failed — check your Geni connection and try again. |
| upload_failed | Upload failed — please try again. |
| coppa_blocked | Children under 13 cannot create standalone accounts. |
| rate_limit | Too many requests — please wait a moment and try again. |

### Validation Schemas

All forms use runtime validation (Zod-equivalent):

- `validatePostCreate` — content ≤2000, ≤10 photos, privacy enum
- `validateAlbumCreate` — title required, ≤100 chars
- `validateMemberInvite` — valid email, relationship required
- `validateGeniConnect` — non-empty OAuth code

---

## Architecture Notes

- Stack: React Native 0.79.6 / Expo SDK 53 / Expo Router 5
- Backend: nSelf Hasura GraphQL (`np_family_*`, `np_chat_*`, `np_moderation_*` tables)
- Auth: JWT via `useAuth` hook / Expo SecureStore
- Storage: AsyncStorage offline queue (MMKV drop-in replacement path)
- Photos: MinIO signed URL upload via nself-photos plugin
