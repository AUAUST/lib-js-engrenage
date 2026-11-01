# utils

Shared public helpers in `src/utils/` and their placement.

## 1. No helper for re-throwing an error with a better message and its cause.

- Matter: wrapping a call in try-catch to re-throw with context is repeated across the codebase (for example `parseJson`, `writeJsonValue`, `resolveBinary`, `parseInstruction`, `syncChangesetConfig`), each time as `throw new Error(message, { cause: error })`.
- Candidate forms:
  1. `wrap(fn, errorFactory)`: runs a nullary callback and throws `errorFactory(error)` on failure, returning the callback's result.
  2. `wrap(error, message, ErrorClass?)` used only inside the catch block: builds the new error from the message and an optional error constructor. Whether it returns or throws the error is an open design decision.
- Open: whether the helper belongs in engrenage or upstream in `@auaust/toolkit` or `@auaust/primitive-kit`; and, first, whether the need and benefits justify it at all, weighed against the existing explicit pattern.
- Expected: a decision on need and placement, then the helper if justified, with call sites migrated.
- Done when the helper exists and replaces the repeated pattern, or the decision not to add one is recorded and the entry removed.
