# Changelog

All notable changes to nFamily will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbers follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
