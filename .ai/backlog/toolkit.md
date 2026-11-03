# toolkit

Upstream @auaust/toolkit decisions that may affect engrenage.

## 1. Pending toolkit decisions may need engrenage support.

- why: none is a requirement yet, and each is settled in its toolkit issue first.
  - Export check in CI (AUAUST/lib-js-toolkit#110 question 6): if the barrel check joins the shared CI sequence, engrenage's script setup and generated workflows include it.
  - Build-time stripping of helper metadata (AUAUST/lib-js-toolkit#116 question 1, option A): runtime metadata objects must never reach the bundle; a tsdown plugin in engrenage's builder is one option. Optional compile-time erasure of identity looseners (AUAUST/lib-js-toolkit#149 question 5) would use the same mechanism.
  - Translation injection (AUAUST/lib-js-toolkit#119 question 3): injecting translations without bundling them by default may need a build plugin.
  - Build output defects (toolkit backlog `merge.18`): empty module entries emit `.d.mts` files that fail `typecheck:dist`. It comes from the tsdown and rolldown-plugin-dts output engrenage's builder configures.
- done: each decision states whether engrenage must change, and the resulting requirements are separate entries.

## 2. `empty` does not exclude `undefined` in its negative guard.

- why: with `const value = [] as string[] | undefined`, `if (!empty(value))` narrows to `(string[] & []) | undefined`, so `undefined` is not excluded. Bug report for `@auaust/toolkit` `empty`, to be reported upstream.
- want: `string[]` (ideally `[string, ...string[]]`).
- done: the guard narrows as expected in a released toolkit version.

## 3. Toolkit has no `RegExp.escape` substitute, and engrenage pins `node: 24` meanwhile.

- why: `@auaust/toolkit` has no regex domain exposing `RegExp.escape`, which is not widely available until `ES2025` is standard.
- want: a toolkit regex domain with an `escape` method; engrenage then drops the `node: 24` option in `engrenage.config.ts` and relies on its own default again.
- done: the toolkit exposes `escape` and `engrenage.config.ts` no longer sets `node`.

## 4. Toolkit's `ProtocolRegistry` needs globals the baseline does not declare.

- why: `ProtocolRegistry` (`src/modules/protocol/types/ProtocolRegistry.ts`) keys entries by `Symbol.dispose` and `Symbol.asyncDispose` and uses the global `Disposable` and `AsyncDisposable`. Against the src tsconfig of a `2026-10` baseline (real TypeScript libs in `lib`, no `noLib`: `es2021` plus the widely available `es2022.*`, `es2023.*` and `es2024.*` libs that `selectEsLibraries("2026-10")` returns), `tsc` reports TS2550 for both symbols and TS2304 for both types, plus TS2550 for `Math.f16round` (`src/modules/math/utils/f16round.ts`). No selected lib declares explicit resource management or `Math.f16round`, since neither is Baseline widely available. Investigation answers:
  1. Toolkit's declarations do not interfere with the inferred globals: `ProtocolRegistry` is a plain exported interface, with no `declare global` or augmentation of `SymbolConstructor`; it only reads the globals, so it fails where they are missing instead of overriding them.
  2. Toolkit cannot rely on the 2023 baseline for these keys. Declaring them itself (`declare global` with `readonly dispose: unique symbol` on `SymbolConstructor` and a `Disposable` interface) compiles and merges silently with a consumer lib that already has them (checked with `tsc` against `esnext`), but it ships a global augmentation that tells every consumer the runtime has `Symbol.dispose`, even on targets without it. Workable options: (a) leave the disposal protocols out of `ProtocolRegistry` until the baseline includes them; (b) add them conditionally, inferring the symbol from the global (`SymbolConstructor extends { readonly dispose: infer Key extends symbol } ? … : {}`) with inline shapes instead of the `Disposable` names, which compiles against both `es2023` and `esnext`; (c) the global augmentation above, accepting the unsound claim; (d) list the protocol through `src.tsconfig.types` from a package that declares it (for example `@types/node` or a future engrenage `src.apis` group), which widens the globals beyond the baseline.
  3. In the published `.d.mts`, the computed key `[Symbol.dispose]` and the `Disposable` name stay references to ambient globals, so they resolve against the consumer's own lib: a consumer whose lib declares explicit resource management gets the same symbol as its own code; one whose lib lacks it gets the same errors in toolkit's declarations (hidden only by `skipLibCheck`). Option (b) keeps both cases clean.
     Decided: option (d). Engrenage ships `disposable` and `float16` `src.apis` groups that never leak into a library's published declarations (#128, plan #119); #127 verifies them on a scratch copy of toolkit.
- want: toolkit adds `disposable` and `float16` to its `src.apis` in its own migration, once the release is out.
- done: toolkit's `engrenage.config.ts` enables both groups.

## 5. Toolkit has no `error` domain for handling thrown values.

- why: the `errors` module exports only `PipelineError`, `ReadonlyError` and `StateError`. Engrenage code that handles `unknown` thrown values works around the gap with `instanceof Error`, hand-rolled `String(value)` descriptions and try/catch blocks (`src/support/commander/utils/formatCommandError.ts`, `src/support/commander/utils/runProgram.ts`).
- want: an `error` domain hosting error-handling helpers; it would be the home of entries 6 and 7 and could absorb the existing error classes. Open: whether it replaces or sits beside `errors`.
- done: toolkit decides whether the domain exists, and engrenage's workarounds move to what it exports or are kept with a stated reason.

## 6. Toolkit has no `isError` instance check.

- why: engrenage uses `instanceof Error` on `unknown` caught values (`src/support/commander/utils/formatCommandError.ts`, `src/support/commander/utils/runProgram.ts`).
- want: an `isError` guard (`value is Error`), probably in the `error` domain of entry 5. Open: whether it only checks `instanceof Error` or also covers cross-realm errors and error-like objects.
- done: toolkit exports it and engrenage's `instanceof Error` checks use it.

## 7. Toolkit could offer `successful()` to run a callback and wrap the thrown value.

- why: catching in JavaScript is awkward because the caught value is `unknown`.
- want: a `successful(callback, onError?)` helper. It runs the callback in a try/catch, returns the callback's value on success and otherwise the second argument; when that argument is a function, it receives the error. Open options for that error: (A) forward the thrown value when it is an `Error`, and otherwise pass a custom wrapper error holding the original thrown value as its source; (B) always pass the custom wrapper error, exposing an interface that tells whether the underlying value was an `Error`, so callers need no `unknown` handling. Open: the wrapper error's name and shape, and whether it belongs to the `error` domain of entry 5.
- done: toolkit decides between the options and exports the helper, and engrenage's try/catch blocks around `unknown` errors use it.

## 8. Toolkit could offer `describe()` and a debug-representation protocol.

- why: engrenage hand-rolls `String(value)` descriptions of thrown values (`src/support/commander/utils/formatCommandError.ts`). The existing hooks (`toJSON`, `valueOf`, `toString` and the custom symbols Node registers) can still be limited for this purpose, so a custom toolkit protocol is not excluded; toolkit has a `protocol` module with `ProtocolRegistry`, a possible home, and whether it fits is open.
- want: (1) a `describe()` stringifier that turns any value into a useful representation for debug logs; (2) a debug-representation protocol, alongside those hooks, giving any value a standard way to represent itself and allow customization, which `describe()` would consume. Open: whether the protocol builds on the existing hooks, a toolkit-specific symbol, or both; whether `describe()` lives in the `error` domain of entry 5 or a general one.
- done: toolkit decides on both requests and engrenage's hand-rolled descriptions use `describe()`.

## 9. Toolkit could offer a `semver` domain.

- why: toolkit aims to provide utilities, not frameworks, so it should offer a consistent and reliable set of tools, not a whole semver framework or class.
- want: a `semver` domain for parsing, comparing and manipulating semantic versions, relying on existing standards and conventions, ideally wrapping or re-exporting a well-known semver library under the toolkit's structure and conventions. It extracts the major, minor and patch components, optionally variants like alpha, beta or rc, and returns them as structured objects or tuples; other helpers that manipulate or compare versions work with these structured representations rather than raw strings; no full class with methods for every operation.

## 10. Toolkit could offer a `hasValue` helper.

- why: in JavaScript it is hard and inconvenient to distinguish a missing key from one explicitly set to `undefined` without verbose checks.
- want: a helper in the object domain checking whether an object has a specific value set for a given key. It returns `false` if the compared value is undefined but the key is missing. For any value other than undefined it equals `object?.[key] === value`; it should most likely rely on `SameValueZero` equality semantics, which treat `NaN` as equal to itself without distinguishing `-0` and `+0`. Name not settled.

## 11. Toolkit could offer a `constant()` deep-freeze helper.

- want: a `constant()` helper that deep-freezes an object so it is immutable at every level, and fails on values that cannot be frozen (`Map`, `Set`, `WeakMap`, `WeakSet` and the like) instead of silently leaving them mutable. Open: the name, the error thrown for unfreezable values, handling of cycles, and the typing (deeply `readonly`).
- done: toolkit decides and exports it.
