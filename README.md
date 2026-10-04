# MyNaksh AI Conversation

A React Native conversation screen where an AI reply can carry recommendation cards. The card types are data. Adding one does not require a new component.

## Run

```sh
npm run server
npm run android
```

The API listens on port 3001. The Android emulator reaches it at `http://10.0.2.2:3001`.

Send the text `fail` to see a failed message and Retry. Set `SIMULATE_LOAD_FAILURE` in `src/services/conversationApi.ts` to `true` before the first launch (empty MMKV) to see the load error.

## Project structure

- `server/` is a dependency-free Node process. `GET /conversation` returns the seed. `POST /messages` accepts `{ clientId, text, replyToId }` and returns the user message plus one AI reply.
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
