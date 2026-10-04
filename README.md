# MyNaksh AI Conversation

A React Native conversation screen where an AI reply can carry recommendation cards. The card types are data. Adding one does not require a new component.

## Run

Start the demo mock before opening the app:

```sh
cd mock-api && npm start
```

Then open the app (`npm run android`). The API listens on `0.0.0.0:3001`. The Android emulator reaches it at `http://10.0.2.2:3001`.

Debug already allows that HTTP call. A release install does not, until `android/app/build.gradle` sets `usesCleartextTraffic` for release. Rebuild and reinstall the release APK after that change. A Metro reload does not apply the flag.

`server/` stays and binds the same port through `npm run server`. Do not run both at once.

Send the text `fail` from the composer to see **Failed** and **Retry**. A `500` that did not come from the app has no bubble. Retry on a `fail` bubble sends `fail` again. Seed bubbles do not show Sent. To film the load error, clear app storage and open the app while the mock is stopped. Start the mock and tap Retry.

A release install bakes JavaScript into the APK. After a JS change, reinstall with `npm run android -- --mode release --no-packager`.

## Demo recording (2–5 min)

Start the mock, then install the app. Clear the app storage on the emulator (Settings, Apps, MyNaksh AI, Storage, Clear storage) and open the app again. A saved thread is not refetched. `clearConversation()` in `src/features/conversation/storage.ts` removes the same MMKV key; there is no button for it.

1. Clear app storage with the mock running. The first launch shows **Loading conversation...**, then an empty thread: **Start your conversation.** Tap **Career**, **Love**, **Health**, or **Money**. The reply asks for a date of birth. Pick a date and confirm. One reading follows, then **Please buy the plan.** `hi` or `start` asks you to choose and shows no card.
2. Long-press the AI reply. Reply shows a preview above the composer. Copy writes the text. Delete removes the message and does not jump the list.
3. On an AI message, tap Dislike, then a chip (Inaccurate, Too Generic, Didn't Help, Too Long). Feedback is on AI messages only.
4. Send `career`. The bubble shows **Sending...**, then **Sent**, and a tarot card appears. Send `fail`. The bubble shows **Failed** and **Retry**, and the mock logs `500`.
5. Stop the mock and clear app storage. The screen shows **Unable to load conversation.** and Retry. Start the mock and tap Retry. The thread loads.

## Project structure

- `mock-api/` is a separate Node app, not part of the React Native bundle. `npm start` runs `node index.js`. `GET /conversation` returns the seed. `POST /messages` accepts `{ clientId, text, replyToId }` and returns the user message plus one AI reply. `server/` is the original process and still serves those routes.
- `src/features/conversation/` is the thread: types, MMKV storage, the Zustand store, the timeline, the list, the row, the composer, feedback, and the action sheet.
- `src/features/recommendations/` is the registry, one card, and the horizontal carousel.
- `src/navigation/RootNavigator.tsx` is a single native stack.

## Component architecture

`MessageList` is an inverted `FlatList`. `MessageRow` switches on a closed set of roles: `user` and `human` share one bubble, `ai` adds cards and feedback, `system` is a line. `buildTimeline` inserts date separators and a grouped flag. Those are not stored.

`RecommendationCarousel` resolves each item through the registry. The default card renders icon, accent, title, and subtitle. A descriptor may supply a custom `Card` when a future layout cannot be expressed that way. An unknown `type` uses the fallback and still renders.

## State management

One Zustand store holds `{ byId, order }`, screen status, and the reply target. A row subscribes with `useConversationStore(state => state.byId[id])`, so a status or feedback change re-renders that row.

MMKV keeps a single JSON value, `conversation.v1`. The store writes it after a successful load, a send, a delete, and feedback. `replyingToId` and screen status are not stored. The first launch with no key fetches the API. After that the device is the source of truth, including an empty thread.

## Recommendation rendering strategy

Register a type with `register(type, { accent, icon })`. The seed registers gemstone, tarot, consultation, article, promotion, and panchang. `remedy` is intentionally unregistered so the fallback is visible. Pressing a card calls `Alert`.

## Performance

The list is virtualized. Rows are memoized and keyed by id. The store is normalized, so unrelated rows keep the same object reference. Recommendation cards sit in a horizontal `ScrollView` instead of a nested virtualized list. A new message scrolls to the latest item. A delete does not, so the position holds. Reanimated runs for the action sheet and the dislike chips only.

## Trade-offs

- FlatList instead of a third-party list.
- Verified on Android. iOS pods were not installed.
- The API is two in-memory routes. Restarting the Node process restores the seed. The app will not refetch once MMKV has a snapshot.
- Delete, reply, and feedback are device state. The server does not store them.
- Message roles stay a switch. Only recommendations are an open registry, because that is the part the product will keep adding.
