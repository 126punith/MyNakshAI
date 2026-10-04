# Change log

Newest first. One short entry per prompt that changes the product. What changed, and what was left out.

## Card, then a date of birth

- A topic chip asks "What is your date of birth?" and does not give the reading yet.
- The composer opens a date picker for that question. The send includes the date and the chosen card. The card name is not saved in MMKV.
- The free reply is that topic's reading plus one line from the birth month, then "Please buy the plan." Text `fail` is still an exact 500.

## One reading, then the plan

- A topic is one bubble with both sentences and its card, then "Please buy the plan."
- Career, Love, Health, and Money stay above the composer. A greeting still asks for that choice and has no card.
- Text `fail` is still an exact 500.

## Empty line sits outside the inverted list

- "Start your conversation." is drawn over the thread, not inside the inverted list, so the sentence is no longer mirrored.

## Empty line reads upright

- "Start your conversation." no longer uses a second vertical flip. The inverted list already unflips the empty view, so the extra flip had turned the sentence around.

## Topic choices, then the plan

- Career, Love, Health, and Money sit above the composer until a user message contains one of those words.
- A topic returns two readings and then "Please buy the plan." A greeting or any other miss asks for that choice and has no card.
- Text `fail` is still an exact 500.

## Empty start and horoscope replies

- The saved thread starts empty. The first launch shows "Start your conversation." The person asks in their own words.
- Usual review words (career, love, health, money, luck, family, study, travel, today) share one reading each. The reply names the area, then says the fuller line is on the plan.
- A miss names those four areas and shows the consultation offer. Text `fail` is still an exact 500. The app client is unchanged.

## Readable send and load states

- A composer message shows Sending..., then Sent. Seed bubbles stay unlabeled. Failed and Retry are separate. A message still sending after a restart is failed, so Retry works.
- The mock waits 1.2s on load and 1.6s on send. Text `fail` is still the only 500. Blank text does not send.
- Loading, empty, and network-failure screens are unchanged.

## Varied fuzzy replies

- `finance`, `money`, `wealth`, and `income` pick a finance reply and an article card.
- A message that misses every phrase picks one of three fallbacks from a hash of the text, so two unmatched questions are not the same reply.
- Text `fail` is still an exact 500. The app client is unchanged.

## Part B demo layout

- The thread list stays above the composer, including when it is empty. "Start your conversation." is the list empty state.
- A failed send scrolls the latest bubble into view. The recommendation row has a fixed height so it can scroll sideways.
- `clearConversation()` deletes the MMKV key. There is no button for it. Clear app storage on the emulator for a fresh recording.

## Scrollable thread for the demo

- The message list fills the space above the composer, so the newest bubble, including Failed · Retry, stays on screen.
- The recommendation row can scroll sideways inside that list on Android. It stays a ScrollView.
- Text `fail` is still the only send that returns 500. A request that did not come from the app still has no bubble.

## Fuzzy reply on the mock

- `mock-api/fuzzy.js` scores the user text against a few phrases and picks one AI reply plus one recommendation. A weak match stays the default tarot reply.
- Text `fail` is still an exact 500. No new dependency. The app client is unchanged.

## Conversation API debug logs

- `mock-api/index.js` logs the status plus the fields that explain it: message count, `fail=1`, `clientId`, `replyToId`, text, AI id, or the 400 reason.
- `src/services/conversationApi.ts` logs `[api]` before each fetch, the HTTP status after, and the message when `fetch` throws.
- The host, routes, and cleartext flag are unchanged. A release install needs a rebuild before the app logs appear in logcat.

## Release send reaches the mock

- The installed release app was still the build that blocks cleartext, so a send never reached `http://10.0.2.2:3001`. The host and routes are unchanged.
- `mock-api/index.js` logs the method, path, and status when a request finishes, including the 500 for text `fail`.
- Reinstall with `npm run android -- --mode release`, then restart the mock so the log line is loaded.

## Release cleartext for the mock API

- Release builds set `usesCleartextTraffic` to false in the React Native Gradle plugin, so the emulator refused `http://10.0.2.2:3001`.
- `android/app/build.gradle` sets that placeholder back to true for release in a later `finalizeDsl`. The host and routes are unchanged. Debug is unchanged.
- Reinstall the release APK. A Metro reload does not apply the flag.

## Demo mock API

- `mock-api/` is a separate Node process (`node:http`, no Express). `data.js` is the same seed. `GET /conversation` and `POST /messages` match the client. Text `fail` still returns 500. It listens on `0.0.0.0:3001`.
- `server/` stays. The app host and client are unchanged.
- Start the demo with `cd mock-api && npm start` before opening the app.

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
