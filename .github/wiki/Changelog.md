# Changelog

All notable changes to nFamily will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbers follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — PENDING (v1.1.0 ecosystem release)

First stable release. ɳFamily bundle ratified. Private family social app for iOS, Android, macOS, Linux, Windows, web.

### Added

- **Full Flutter app**: screens for social feed, photo albums, activity feed, family tree (GEDCOM), family chat, shared calendar, location sharing.
- **ɳFamily bundle integration**: connects to all 9 backend plugins (social, photos, activity-feed, moderation, realtime, cms, chat, geolocation, calendar). Requires nFamily bundle ($0.99/mo / $9.99/yr) or ɳSelf+ ($3.99/mo / $39.99/yr).
- **CSAM protection**: moderation plugin's PhotoDNA scanner runs on all uploaded photos automatically; user is never shown flagged content.
- **Web SaaS**: `family.nself.org` (web/nfamily) launches at v1.1.0.
- **`nself bundle install family` support**: installs all 9 ɳFamily plugins.
- **Demo mode**: read-only "demo tree" for users without a bundle license.
- **Multi-app isolation**: all data partitioned by `source_account_id`.

### Changed

- Minimum nSelf CLI version: v1.1.0.

---

## [Unreleased]

### Added
- pubspec.yaml Flutter project scaffold
- CI workflows: flutter analyze + clean-root + doc-sync
- .github/wiki/Home.md placeholder
- .github/FUNDING.yml
- onboarding install section in README

---

## [0.1.0] — 2026-04-18

### Added
- Initial repo scaffold: README, LICENSE (MIT), .gitignore, .claude/
- nself-org/nfamily GitHub repository created (public)
- PRI (`.claude/CLAUDE.md`) with nFamily bundle dependency table

### Notes
- Scaffolding only — no Flutter app code yet
- Full v1.0.0 implementation roadmap: nSelf P-FAM-4 + P-FAM-5 phases

## v1.0.12 (P96 — 2026-04-25)

### Added
- Flutter ship-ready: l10n ARB files generated for all supported locales.
- Brand assets updated to v1.0.12 icon set.
- Auth SDK migration: replaced direct Hasura auth calls with nSelf auth SDK client.
- Initial scaffold complete for nFamily bundle (social, photos, activity-feed, moderation, realtime, cms, chat plugins).
