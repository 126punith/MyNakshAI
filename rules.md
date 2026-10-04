# Rules

Read this before adding a file or a dependency.

- Build only what the brief or change.md asks for. No second screen, design system, debug menu, Storybook, dark mode, or i18n. The only test is the timeline check that replaced the template render test.
- A new dependency needs a call site in the same change. No Express, Axios, AsyncStorage, database, auth, or Zustand persist middleware.
- One responsibility per file. Extract a component only when two call sites share it. User and human share one bubble. Recommendations share one card.
- A new recommendation type is a registry line (icon, accent, title, subtitle). Add a custom Card only when that layout cannot say it. Unknown types still render.
- Message roles stay a closed switch: user, ai, human, system. Do not add a second registry for them.
- Conversation state is normalized `{ byId, order }` in one Zustand store. Date separators and grouping come from `buildTimeline`, not from stored fields.
- Each row subscribes to its own id. The chat list is an inverted FlatList. Cards use a horizontal ScrollView.
- MMKV has one key, `conversation.v1`. Write through after load, send, delete, and feedback. Do not persist `replyingToId` or screen status. Fetch only when the snapshot is missing.
- The server is `node:http` with `GET /conversation` and `POST /messages`. `clientId` is echoed. Text `fail` is the only send failure. Delete, reply, and feedback stay on the device.
- Reanimated is for the dislike chips and the action sheet only.
- TypeScript stays strict. No `any`. No commented-out code, no empty wrappers, no code that only exists for a future type we have not registered.
- After a prompt that changes scope or behavior, append change.md before writing the code.
