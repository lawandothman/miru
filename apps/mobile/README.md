# Miru Mobile

Expo/React Native mobile app for Miru.

## Development

```bash
# Install dependencies (from repo root)
pnpm install

# Start dev server
npx expo start --ios
```

### Testing on a physical device

```bash
npx expo run:ios --device
```

Use a physical device when testing Apple Sign-In or Google Sign-In — neither works reliably in Simulator.

## Releasing

Releases are automated via GitHub Actions. Pushing a version tag builds on EAS, submits to TestFlight, and creates a GitHub Release.

```bash
git tag v1.1.0
git push origin v1.1.0
```

The version in `app.json` is patched from the tag in CI (not committed back). The build number is auto-incremented by EAS.

### Re-releasing the same version

Delete and re-push the tag. EAS increments the build number, so App Store Connect sees it as a new build.

```bash
git tag -d v1.1.0
git push origin :refs/tags/v1.1.0
git tag v1.1.0
git push origin v1.1.0
```

### Preview builds

Trigger manually from GitHub Actions: **Actions > Preview Build > Run workflow**. Pick a branch and platform (ios/android/all). Uses the `preview` profile with `internal` distribution — installs via QR code/link from EAS, no App Store Connect involved.

### Local production-like build

```bash
cd apps/mobile
eas build --profile preview --platform ios --local
```

Builds the `.ipa` on your machine. Install on a device via Xcode or drag into Simulator.

## Setup (one-time)

1. Add `EXPO_TOKEN` as a GitHub Actions secret (Settings > Secrets > Actions)
2. Fill in `ascAppId` and `appleTeamId` in `eas.json` under `submit.production.ios`
   - `ascAppId`: numeric ID from your App Store Connect URL
   - `appleTeamId`: 10-character ID from [developer.apple.com/account](https://developer.apple.com/account) Membership details

## Project structure

```
app/              # Expo Router file-based routes
  (tabs)/         # Tab navigation
  (auth)/         # Auth screens
assets/           # Icons, splash screen
components/       # Shared components
lib/              # Utilities, auth client, tRPC client
```
