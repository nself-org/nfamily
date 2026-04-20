# Family Social Feed

The nFamily social feed is a private, family-only social timeline. Posts, photos, events, and milestones appear in chronological order for all family members.

**Status:** Planned — target P94 S37 (nFamily Sprint Wave 3)

---

## Post Types

| Type | Description |
|------|-------------|
| Text | Plain text post with optional rich formatting |
| Photo | Single photo or photo album post |
| Video | Video post (uploaded to nSelf MinIO storage) |
| Event | Calendar event with RSVP |
| Milestone | Birthday, anniversary, achievement, life event |
| Chore | Chore completion announcement (from chore wall) |

---

## Reactions

Reactions use 5 types: Heart, Hug, Celebrate, Laugh, Proud. Any family member can react to any post. Reaction counts and reactor names are visible to all family members.

---

## Comments

Threaded comments on any post. Mentions (`@name`) notify the mentioned member. Replies nest one level deep.

---

## Privacy

The feed is completely private. No data leaves your nSelf instance. Posts are not indexed, not crawled, not accessible from outside your family's deployment. Family members connect via your custom domain or local network.

---

## Chore Wall

The chore wall is an embedded section in the feed sidebar:

- A card-based list of open chores, each assigned to a family member
- When a chore is marked complete, a celebration post appears automatically in the feed
- Star rewards are tallied per family member and displayed in a sidebar leaderboard

---

## `social` Plugin

The feed is powered by the `social` plugin (`plugins-pro/paid/social/`):

- Fan-out write model: a post write propagates to follower timelines via a Postgres queue
- `activity-feed` plugin handles the fan-out
- All data stored in `np_social_posts`, `np_social_reactions`, `np_social_comments` tables
