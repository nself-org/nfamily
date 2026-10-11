# ɳFamily

Private family social + genealogy app. Self-hosted. An Expo / React Native client for iOS and Android, backed by your own [ɳSelf](https://nself.org) instance running the Family Bundle.

## Status

**Scaffolding — not yet functional.** ɳFamily is listed as "Coming soon" in the ɳSelf product line and ships after ɳTask, ɳChat and ɳClaw. There is no release, no app store build and no `backend/` directory in this repo yet; the backend wiring lands when that work starts.

## What it is

ɳFamily is a private alternative to Ancestry.com, Geni.com, MyHeritage and FamilySearch, combined with a photo-sharing and activity-feed layer for living family members. You own the data and the hardware. The plan includes importing an existing tree from Geni and GEDCOM 5.5.1 export, so your data is never locked in.

## Stack

| Layer | What |
|---|---|
| App | Expo SDK 53, React Native 0.79, React 19, TypeScript, Expo Router |
| Data | Apollo Client over Hasura GraphQL on your ɳSelf backend (no direct database access) |
| Backend | ɳSelf CLI plus the licensed plugins of the [Family Bundle](https://nself.org/family) |
| Platforms | iOS and Android (EAS builds) |

Exact versions live in [package.json](package.json).

## How it works

- The backend runs on your own ɳSelf instance. The Family Bundle plugins are licensed: get them with the Family Bundle or with [ɳSelf+](https://nself.org/pricing).
- This app is MIT-licensed and free forever.
- "Family Bundle" is the self-hosted product. "ɳFamily" at family.nself.org is the hosted service, also coming later.

## Develop

```bash
pnpm install
cp .env.example .env   # fill in per-environment values; never put secrets in EXPO_PUBLIC_* vars
pnpm start             # Expo dev server (pnpm ios / pnpm android for a simulator)
pnpm ci:local          # lint, type check, tests
```

The app has nothing to talk to until the Family Bundle backend exists. For the backend side, see the [ɳSelf docs](https://nself.org).

## License

MIT. See [LICENSE](LICENSE).
