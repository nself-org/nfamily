# CI: Continuous Integration

## Android Debug Build Job

Added in `T-E4-W4-S6-T16`. The `android-build` job in `.github/workflows/ci.yml` runs on every push to `main` and on pull requests.

**Stack:** Expo SDK 53 (managed workflow) + Node.js 20 + pnpm.
**No signing secrets required** — this job exports the JS bundle only; no native Android SDK required.

Steps:
1. `pnpm install --frozen-lockfile` — resolves all JS dependencies.
2. `npx expo export --platform android` — validates the JS bundle can be built for Android.

Since nFamily uses the **Expo managed workflow**, there is no pre-generated `android/` directory. The JS bundle export validates that the app code is buildable for Android without requiring a full native Android SDK setup in CI. Native signed builds (APK/AAB for Play Store) are handled by `release.yml` using EAS Build.

**Trigger:** Automatic on `push` to `main` and on `pull_request`.

## Lint and Test Job

The `lint-and-test` job runs TypeScript lint and Jest tests on every push/PR:

- `pnpm lint` — ESLint on `src/`
- `pnpm test` — Jest unit tests
