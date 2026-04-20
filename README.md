# nFamily

Private family social + genealogy platform. Self-hosted. Flutter app for iOS, Android, macOS, Windows, Linux, and web. Powered by the [nSelf](https://nself.org) CLI + the nFamily plugin bundle.

## Status

**Scaffolding — not yet functional.** Full v1.0 implementation roadmap lives in the nSelf ecosystem planning docs.

## What it is

nFamily is a private alternative to Ancestry.com, Geni.com, MyHeritage, and FamilySearch, combined with a photo-sharing + activity-feed layer for living family members. You own the data and the hardware. Migrate your existing tree in from Geni (OAuth + photo download) and keep working.

The family tree engine (`family` plugin) is GEDCOM 5.5.1-compatible, so you can export your data any time.

## How it works

- Backend runs on your own nSelf instance via the **nFamily plugin bundle** (`$0.99/mo` or free via [ɳSelf+](https://nself.org/pricing))
- This app is MIT-licensed and free forever
- Bundle plugins: `family`, `family-geni`, `social`, `photos`, `activity-feed`, `moderation`, `realtime`, `cms`, `chat`

## Install

**Status: Not yet available.** Full v1.0.0 ships in a future release. Backend scaffold + Flutter app are in progress.

When v1.0.0 ships, installation will follow the standard nSelf pattern:

```bash
# 1. Install nSelf CLI
brew tap nself-org/nself && brew install nself

# 2. Initialize a new nSelf project
mkdir my-nfamily && cd my-nfamily
nself init

# 3. Install the nFamily plugin bundle (requires $0.99/mo or ɳSelf+ license)
nself license set nself_pro_xxxxxxxx...
nself plugin install family family-geni social photos activity-feed moderation realtime cms chat

# 4. Build + start the backend
nself build
nself start

# 5. Run the Flutter app
flutter run
```

**Install failure troubleshooting:**
- License error: verify your key at https://nself.org/account
- Plugin not found: update nSelf CLI (`brew upgrade nself`)
- Backend offline: check `nself status` for service health
- App cannot connect: confirm `NSELF_API_URL` env var points to your backend

For now, see the [nSelf ecosystem roadmap](https://nself.org) for the timeline.

## License

MIT. See [LICENSE](LICENSE).
