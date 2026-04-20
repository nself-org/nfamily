# Google Workspace Integration

nFamily can provision a personal `@familyname.com` Google Workspace account for each family member. Every member gets a real Gmail address, Google Calendar, and Google Drive under your family domain.

**Status:** Planned — target P94 S43

---

## Requirements

- nFamily bundle: `nself plugin install family`
- A domain you control (e.g., `familyname.com`)
- A Google Workspace for Families account (or Google Workspace Essentials)

---

## Setup

1. Go to **nFamily → Settings → Google Workspace**.
2. Enter your Google Workspace admin email and connect via OAuth.
3. Enter your family domain.
4. For each family member, nFamily provisions a `member@familyname.com` account via the Google Admin SDK.

---

## What Gets Provisioned

For each family member:

| Resource | Details |
|----------|---------|
| Gmail address | `firstname@familyname.com` |
| Google Calendar | Private family calendar shared with all members |
| Google Drive | Shared family folder with member subfolder |
| Google Meet | Video calls from the family calendar |

---

## Sync with nFamily Calendar

When Google Workspace is connected, nFamily's built-in calendar syncs bidirectionally with Google Calendar:

- Events created in nFamily appear in Google Calendar
- Events created in Google Calendar (on the family calendar) appear in nFamily
- RSVPs sync both directions

---

## Privacy Note

Google Workspace provisioning requires a Google account and domain. This is the one nFamily feature that involves a third-party service. All other nFamily data (feed, photos, family tree, chores) remains entirely within your nSelf instance.

If you do not want Google integration, simply skip the Google Workspace setup. nFamily works fully without it.
