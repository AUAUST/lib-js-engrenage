# utils

Shared public helpers in `src/utils/` and their placement.

## 1. No helper re-throws an error with a better message and its cause.

- why: wrapping a call in try-catch to re-throw with context is repeated across the codebase (for example `parseJson`, `writeJsonValue`, `resolveBinary`, `parseInstruction`, `syncChangesetConfig`), each time as `throw new Error(message, { cause: error })`. Candidate forms: (1) `wrap(fn, errorFactory)` runs a nullary callback and throws `errorFactory(error)` on failure, returning the callback's result; (2) `wrap(error, message, ErrorClass?)` used only inside the catch block builds the new error from the message and an optional error constructor, and whether it returns or throws is an open design decision. Open: first, whether the need and benefits justify a helper at all, weighed against the existing explicit pattern; then whether it belongs in engrenage or upstream in `@auaust/toolkit` or `@auaust/primitive-kit`.
- want: a decision on need and placement, then the helper if justified, with call sites migrated.
- done: the helper exists and replaces the repeated pattern, or the decision not to add one is recorded and the entry removed.
