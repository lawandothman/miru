# Miru Mobile

Expo/React Native mobile app for Miru.

### Testing on a physical device

```bash
npx expo run:ios --device
```

Use a physical device when testing Apple Sign-In or Google Sign-In — neither works reliably in Simulator.

## Releasing

Releases are automated via GitHub Actions. Pushing a version tag builds on EAS, submits to TestFlight, and creates a GitHub Release.

```bash
git tag v1.3.0
git push origin v1.3.0
```

The Expo version in `app.config.ts` reads from `APP_VERSION` in CI and falls back to the checked-in default locally. The build number is auto-incremented by EAS.

### Re-releasing the same version

Delete and re-push the tag. EAS increments the build number, so App Store Connect sees it as a new build.

```bash
git tag -d v1.3.0
git push origin :refs/tags/v1.3.0
git tag v1.3.0
git push origin v1.3.0
```

### Local production-like build

```bash
cd apps/mobile
eas build --profile preview --platform ios --local
```

Builds the `.ipa` on your machine. Install on a device via Xcode or drag into Simulator.

