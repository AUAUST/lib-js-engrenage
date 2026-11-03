# toolkit

Upstream @auaust/toolkit decisions that may affect engrenage.

## 1. Pending toolkit decisions that may need engrenage support.

- Problem: open toolkit decisions may require engrenage changes; none is a requirement yet, and each is settled in its toolkit issue first.
  - Export check in CI (AUAUST/lib-js-toolkit#110 question 6): if the barrel check joins the shared CI sequence, engrenage's script setup and generated workflows include it.
  - Build-time stripping of helper metadata (AUAUST/lib-js-toolkit#116 question 1, option A): runtime metadata objects must never reach the bundle; a tsdown plugin in engrenage's builder is one option. Optional compile-time erasure of identity looseners (AUAUST/lib-js-toolkit#149 question 5) would use the same mechanism.
  - Translation injection (AUAUST/lib-js-toolkit#119 question 3): injecting translations without bundling them by default may need a build plugin.
  - Build output defects (toolkit backlog `merge.18`): empty module entries emit `.d.mts` files that fail `typecheck:dist`. It comes from the tsdown and rolldown-plugin-dts output engrenage's builder configures.
- Done when each decision states whether engrenage must change, and the resulting requirements are separate entries.

## 2. `empty` does not exclude `undefined` in its negative guard.

- Problem: with `const value = [] as string[] | undefined`, `if (!empty(value))` narrows to `(string[] & []) | undefined`, so `undefined` is not excluded. Expected `string[]` (ideally `[string, ...string[]]`).
- Context: bug report for `@auaust/toolkit` `empty`; to be reported upstream.
- Done when the guard narrows as expected in a released toolkit version.

## 3. No `RegExp.escape` substitute, and engrenage pins `node: 24` meanwhile.

- Problem: `@auaust/toolkit` has no regex domain exposing `RegExp.escape`, which is not widely available until `ES2025` is standard.
- Expected: a toolkit regex domain with an `escape` method. Once it is available, engrenage drops the `node: 24` option in `engrenage.config.ts` and relies on its own default again.
- Done when the toolkit exposes `escape` and `engrenage.config.ts` no longer sets `node`.

## 4. Toolkit's `ProtocolRegistry` needs globals the baseline does not declare.

- Matter: toolkit's `ProtocolRegistry` (`src/modules/protocol/types/ProtocolRegistry.ts`) keys entries by `Symbol.dispose` and `Symbol.asyncDispose` and uses the global `Disposable` and `AsyncDisposable`. Against the src tsconfig of a `2026-10` baseline (real TypeScript libs in `lib`, no `noLib`: `es2021` plus the widely available `es2022.*`, `es2023.*` and `es2024.*` libs that `selectEsLibraries("2026-10")` returns), `tsc` reports TS2550 for both symbols and TS2304 for both types, plus TS2550 for `Math.f16round` (`src/modules/math/utils/f16round.ts`). No selected lib declares explicit resource management or `Math.f16round`, since neither is Baseline widely available.
- Answers to the investigation:
  1. Toolkit's declarations do not interfere with the inferred globals: `ProtocolRegistry` is a plain exported interface, with no `declare global` or augmentation of `SymbolConstructor`; it only reads the globals, so it fails where they are missing instead of overriding them.
  2. Toolkit cannot rely on the 2023 baseline for these keys. Declaring them itself (`declare global` with `readonly dispose: unique symbol` on `SymbolConstructor` and a `Disposable` interface) compiles and merges silently with a consumer lib that already has them (checked with `tsc` against `esnext`), but it ships a global augmentation that tells every consumer the runtime has `Symbol.dispose`, even on targets without it. Workable options: (a) leave the disposal protocols out of `ProtocolRegistry` until the baseline includes them; (b) add them conditionally, inferring the symbol from the global (`SymbolConstructor extends { readonly dispose: infer Key extends symbol } ? … : {}`) with inline shapes instead of the `Disposable` names, which compiles against both `es2023` and `esnext`; (c) the global augmentation above, accepting the unsound claim; (d) list the protocol through `src.tsconfig.types` from a package that declares it (for example `@types/node` or a future engrenage `src.apis` group), which widens the globals beyond the baseline.
  3. In the published `.d.mts`, the computed key `[Symbol.dispose]` and the `Disposable` name stay references to ambient globals, so they resolve against the consumer's own lib: a consumer whose lib declares explicit resource management gets the same symbol as its own code; one whose lib lacks it gets the same errors in toolkit's declarations (hidden only by `skipLibCheck`). Option (b) keeps both cases clean.
- Decided: option (d). Engrenage ships `disposable` and `float16` `src.apis` groups that never leak into a library's published declarations (#128, plan #119); #127 verifies them on a scratch copy of toolkit.
- Remaining: toolkit adds `disposable` and `float16` to its `src.apis` in its own migration, once the release is out.
- Done when toolkit's `engrenage.config.ts` enables both groups.

## 5. Toolkit has no `error` domain for handling thrown values.

- Context: the `errors` module exports only `PipelineError`, `ReadonlyError` and `StateError`. Engrenage code that handles `unknown` thrown values works around the gap with `instanceof Error`, hand-rolled `String(value)` descriptions and try/catch blocks (`src/support/commander/utils/formatCommandError.ts`, `src/support/commander/utils/runProgram.ts`).
- Request: consider an `error` domain hosting error-handling helpers. It would be the home of entries 6 and 7 and could absorb the existing error classes; whether it replaces or sits beside `errors` is open.
- Done when toolkit decides whether the domain exists, and engrenage's workarounds move to what it exports or are kept with a stated reason.

## 6. Toolkit has no `isError` instance check.

- Request: an `isError` guard (`value is Error`) in toolkit, probably in the `error` domain of entry 5. Toolkit has none today.
- Context: engrenage uses `instanceof Error` on `unknown` caught values (`src/support/commander/utils/formatCommandError.ts`, `src/support/commander/utils/runProgram.ts`).
- Open: whether it only checks `instanceof Error` or also covers cross-realm errors and error-like objects.
- Done when toolkit exports it and engrenage's `instanceof Error` checks use it.

## 7. Toolkit could offer `successful()` to run a callback and wrap the thrown value.

- Request: a `successful(callback, onError?)` helper. It runs the callback in a try/catch, returns the callback's value on success and otherwise the second argument; when that argument is a function, it receives the error.
- Context: catching in JavaScript is awkward because the caught value is `unknown`.
- Open options for the error handed to the second argument:
  - A: forward the thrown value when it is an `Error`, and otherwise pass a custom wrapper error holding the original thrown value as its source.
  - B: always pass the custom wrapper error, exposing an interface that tells whether the underlying value was an `Error`, so callers need no `unknown` handling.
- Open: the wrapper error's name and shape, and whether it belongs to the `error` domain of entry 5.
- Done when toolkit decides between the options and exports the helper, and engrenage's try/catch blocks around `unknown` errors use it.

## 8. Toolkit could offer `describe()` and a debug-representation protocol.

- Request 1: a `describe()` stringifier for debugging that turns any value into a useful representation for debug logs. Engrenage hand-rolls `String(value)` descriptions of thrown values (`src/support/commander/utils/formatCommandError.ts`).
- Request 2: a debug-representation protocol, alongside `toJSON`, `valueOf`, `toString` and the custom symbols Node registers, giving any value a standard way to represent itself and allow customization. `describe()` would consume it.
- Context: those existing hooks can still be limited for this purpose, so a custom toolkit protocol is not excluded. Toolkit has a `protocol` module with `ProtocolRegistry`, a possible home; whether it fits is open.
- Open: whether the protocol builds on the existing hooks, a toolkit-specific symbol, or both; whether `describe()` lives in the `error` domain of entry 5 or a general one.
- Done when toolkit decides on both requests and engrenage's hand-rolled descriptions use `describe()`.

## 9. Toolkit could offer a `semver` domain

- Request: a `semver` domain in toolkit that provides utilities for parsing, comparing, and manipulating semantic versions. It should try to rely on existing standards and conventions, ideally wrapping or re-exporting a well-known semver library under the toolkit's structure and conventions.
- Because toolkit aims to provide utilities, not frameworks, it should focus on offering a consistent and reliable set of tools, not a whole semver framework or class. It should allow to extract the major, minor, and patch components, optionally variants like alpha, beta, or rc, and return them as structured objects or tuples; other helpers that manipulate or compare versions should work with these structured representations rather than raw strings; it should not implement a full class with methods for every operation.

## 10. Toolkit could offer a `hasValue` helper

- The helper, belonging to the object domain, should check whether a given object has a specific value set for a given key. The catch is that it must return `false` if the compared value is undefined but the key is missing in the object. In JavaScript, it's often hard and inconvenient to distinguish between a key that is missing and a key that is explicitly set to `undefined` without writing verbose checks. Thus, the helper should provide a concise and reliable way to perform this check.
- For any value other than undefined, it'd be equivalent to `object?.[key] === value`. It should also most likely rely on `SameValueZero` equality semantics, which treat `NaN` as equal to itself without distinguishing `-0` and `+0`.
- Name not settled.

## 11. Toolkit could offer a `constant()` deep-freeze helper

- Request: a `constant()` helper that deep-freezes an object so it is immutable at every level, and fails on values that cannot be frozen (`Map`, `Set`, `WeakMap`, `WeakSet` and the like) instead of silently leaving them mutable.
- Open: the name, the error thrown for unfreezable values, handling of cycles, and the typing (deeply `readonly`).
- Done when toolkit decides and exports it.
