# COPPA Age-Gate — ɳFamily

**Approach ratified:** Option A — Hard refuse signup if reported DOB indicates age <13
**Decision date:** 2026-05-11
**Backend gate:** v1.1.x patch
**Companion app GA:** v1.3.0

---

## What Option A Means

ɳFamily blocks account creation when the user's reported date of birth indicates they are under 13 years of age at the time of signup. There is no workaround — the signup flow terminates with an error page and does not create any account record.

## Implementation Requirements

### Signup Flow

- DOB is collected at signup using a typed date-entry field (not free text, not a checkbox)
- Backend validates the submitted DOB against current date; if `(today - DOB) < 13 years`, reject
- Rejection returns a non-descript error page: "Sorry, you must be 13 or older to use ɳFamily"
- No account record is created; no DOB is stored on rejection

### Data Handling (on accepted signups)

- DOB stored encrypted-at-rest using `nself-vault` envelope encryption
- DOB is not exposed in any API response after account creation
- DOB used only for age verification; not surfaced in profile or admin UI by default

### Backend Gate (v1.1.x)

- `COPPA_AGE_GATE_ENABLED=true` env var required; `nself doctor --deep` checks this via LEGAL-COPPA-01
- Age check enforced in the auth signup webhook before the Hasura `insert_np_users` mutation fires
- Parental consent flow is out of scope for v1.1.x (Option A hard-rejects; no consent path)

### Companion App (v1.3.0)

- Flutter signup screen enforces the same DOB entry + client-side pre-check
- Client-side check is UX-only; backend gate is the authoritative enforcement
- "You must be 13+" copy appears inline on the DOB picker if age is below threshold

## What This Does NOT Cover

- Parental consent collection (COPPA safe harbor) — deferred, evaluate post v1.3.0 GA
- GDPR Article 8 compliance (age of digital consent varies by EU member state) — tracked separately
- Re-age-checking existing accounts — accounts created before gate was enabled are grandfathered

## Testing

- Unit test: DOB = today - 12 years → reject
- Unit test: DOB = today - 13 years exactly → accept (boundary)
- Unit test: DOB = today - 14 years → accept
- E2E: submit signup with age 12 → see error page, no account created, no DB row
- `nself doctor --deep` passes LEGAL-COPPA-01 when `COPPA_AGE_GATE_ENABLED=true`

## Related

- `LEGAL-COPPA-01` doctor check (CLI)
- `nself-vault` plugin — encryption at rest for DOB
- `nself-scan` free plugin — CSAM scanning for uploaded photos (companion concern)
- GDPR Article 9 doctor check (medical consent) — separate but co-located in same v1.1.0 doctor sprint
