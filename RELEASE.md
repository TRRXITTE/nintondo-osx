# How to make a release

## Apple

### Manual upload in Xcode

1. Open `ios/BlueWallet.xcworkspace` in Xcode.
2. Select the `BlueWallet` scheme and the `Any iOS Device (arm64)` destination.
3. In `Signing & Capabilities`, verify the Apple team is `MC52ZBYMUT` for the app, watch app, stickers, and widget targets.
4. Confirm the App Store Connect app and profiles exist for:
   `io.nintondo.osx`, `io.nintondo.osx.watch`, `io.nintondo.osx.Stickers`, `io.nintondo.osx.MarketWidget`.
5. Update the marketing version and build number.
6. Run `Product > Archive`.
7. In Organizer, select the archive and choose `Distribute App > App Store Connect > Upload`.
8. After the upload finishes, wait for processing in TestFlight.

### CI / Fastlane

- The GitHub workflow `.github/workflows/build-ios-release-pullrequest.yml` builds the IPA and uploads it to TestFlight.
- Required secrets: `APPLE_ID`, `MATCH_PASSWORD`, `GIT_ACCESS_TOKEN`, `GIT_URL`, `ITC_TEAM_ID`, `ITC_TEAM_NAME`, `KEYCHAIN_PASSWORD`, `APP_STORE_CONNECT_API_KEY_CONTENT`.
- Push to `master` or add the `testflight` label to a PR to trigger the upload job.

## Android

* TBD
