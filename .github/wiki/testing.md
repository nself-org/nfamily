# ɳFamily Testing Guide

## Overview

ɳFamily uses jest-expo for unit + integration tests and Detox/Maestro for e2e on mobile.

---

## Unit + Integration tests — jest-expo

**Stack:** `jest-expo` preset · `@testing-library/react-native` · GraphQL mocked via MSW.

**Run locally:**

```bash
pnpm test               # run once
pnpm test -- --watch    # watch mode
pnpm test -- --coverage # coverage report (>= 80% line required)
```

**CI gate:**

```bash
pnpm ci:local   # lint + tsc + jest
```

**Config:** `jest` field in `package.json` (preset: jest-expo).

**Test locations:**

| Directory | What's tested |
|-----------|--------------|
| `src/lib/__tests__/` | COPPA age-gate logic, form validation utilities |
| `src/app/__tests__/` | Auth flows, family management, notifications |

---

## E2E tests — Maestro (post flow)

**Framework:** Maestro (lightweight mobile e2e).

**Note:** E2E tests pending simulator provisioning. Tracked in `.claude/inbox/`.

**Test location:** `e2e/` (when created) — covers post → feed → comment flow.

---

## CI Gate Summary

| Command | What runs |
|---------|-----------|
| `pnpm ci:local` | ESLint + tsc + jest (no simulator needed) |
| `pnpm test -- --coverage` | jest with coverage >= 80% line |
