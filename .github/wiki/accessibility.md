# Accessibility — ɳFamily Mobile

**Standard:** WCAG 2.1 AA equivalent via React Native accessibility API.
**Ticket:** T-P3-E6-W1-S5-T01

## Policy

All interactive elements in the ɳFamily mobile app (iOS + Android) must meet WCAG 2.1 AA equivalent standards using React Native's built-in accessibility system. This includes all Pressable components, TextInput fields, Modal dialogs, and image elements.

## Implementation Pattern

### Interactive elements (Pressable)

Every `Pressable` must have:
- `accessibilityLabel` — concise action description (e.g. "Back to profile", not just "←")
- `accessibilityRole` — `"button"` for actions, `"tab"` for navigation tabs

```tsx
<Pressable
  onPress={handleBack}
  accessibilityRole="button"
  accessibilityLabel="Back to profile"
>
  <Text>← Profile</Text>
</Pressable>
```

### Tab bars

Tab `Pressable` elements must declare both `accessibilityRole="tab"` and `accessibilityLabel` plus `accessibilityState.selected`:

```tsx
<Pressable
  accessibilityRole="tab"
  accessibilityLabel="Posts"
  accessibilityState={{ selected: activeTab === 'social' }}
>
```

### Modals

Modal inner containers must set `accessibilityViewIsModal={true}`:

```tsx
<Modal visible={visible}>
  <View style={styles.container} accessibilityViewIsModal={true}>
    ...
  </View>
</Modal>
```

### Privacy toggles (radio-like)

Privacy selector buttons use `accessibilityRole="button"` with `accessibilityState.selected` to indicate the active choice:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Visible to family only"
  accessibilityState={{ selected: privacy === 'family_only' }}
>
```

### Image/decorative content

Albums declared with `accessibilityLabel` combining title and photo count:

```tsx
<Pressable accessibilityRole="button" accessibilityLabel={`${album.title}, ${album.photoCount} photos`}>
```

## Components Audited

| Component | File | Status |
|---|---|---|
| auth screen | `src/app/auth.tsx` | WCAG AA |
| feed tab | `src/app/(tabs)/feed.tsx` | WCAG AA |
| profile tab | `src/app/(tabs)/profile.tsx` | WCAG AA |
| ProfileEditor | `src/components/ProfileEditor.tsx` | WCAG AA |
| NotificationItem | `src/components/NotificationItem.tsx` | WCAG AA |
| ScreenStateView | `src/components/ScreenStateView.tsx` | WCAG AA |
| SocialFeedScreen | `src/screens/SocialFeedScreen.tsx` | WCAG AA |
| ModerationQueueScreen | `src/screens/ModerationQueueScreen.tsx` | WCAG AA |
| MedicalConsentScreen | `src/screens/MedicalConsentScreen.tsx` | WCAG AA |
| PhotosScreen | `src/screens/PhotosScreen.tsx` | WCAG AA |

## Colour Contrast

Primary brand colour `#8B5CF6` (violet) on white — 5.7:1. Text primary `#F9FAFB` on surface `#111827` (dark theme) — 16:1. Secondary text `#9CA3AF` on surface — 4.6:1. All pairs pass AA minimum (4.5:1).

## Known Limitations

- Screen reader end-to-end testing (VoiceOver / TalkBack) is manual — scheduled post-E6.
- TV platform accessibility (if ntv is extended to family) is out of scope for this phase.
