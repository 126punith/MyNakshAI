# Change log

Newest first. One short entry per prompt that changes the product. What changed, and what was left out.

## Android Studio Gradle sync

- AGP stays at 9.2.1. React Native 0.87 pins it. Android Studio 2025.2 stops at AGP 8.13.0, so Android Studio 2026.2 was installed beside it. The running 2025.2 app was left open because its quit prompt was cancelled.
- `android/settings.gradle` sets `REACT_NATIVE_NODE_MODULES_DIR` before project evaluation so library scripts do not shell out to `node` just to find React Native.
- Android Studio does not load nvm. `sudo` was unavailable, so `node` was added to the user GUI PATH with `launchctl setenv` and a login LaunchAgent, instead of a `/usr/local/bin` symlink. No new dependency.

## Implement the conversation app

- React Native CLI app, Zustand, one screen, Android emulator. iOS pod install left out.
- `rules.md` and this file are the working agreement.
- Mock API is `server/index.js` (`node:http` only): `GET /conversation` and `POST /messages`. No Express.
- `react-native-worklets` is required by Reanimated 4. `react-native-nitro-modules` is required by MMKV 4. Neither is a product choice.
- MMKV key `conversation.v1` is the device copy after the first successful load. A missing key fetches. An empty saved thread does not refetch, so a cleared conversation stays empty.
- Send uses `clientId`. Seed data spans two days, groups two user messages, and includes an unregistered `remedy` card so the fallback path is visible.
- Carousel is a horizontal ScrollView. Like and dislike are exclusive.
- The template render test was replaced with a timeline test so `npm test` does not load native modules.

## Decisions made before the first commit

- CLI app, Zustand, Android emulator only. iOS pod install left out.
- Lean structure: descriptor registry, one recommendation card, shared user/human bubble, inverted FlatList.
- Mock API is a dependency-free Node process with two routes, not an in-app fake and not Express.
- MMKV snapshot `conversation.v1` is the device source of truth after the first load.
- Send uses `clientId`. Seed data shows a date separator and grouped messages. Carousel is a ScrollView. Like and dislike are exclusive.
- `rules.md` and `change.md` are maintained from here on.
