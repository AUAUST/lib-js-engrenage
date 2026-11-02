# toolkit

Upstream @auaust/toolkit decisions that may affect engrenage.

## 1. Pending toolkit decisions that may need engrenage support.

- Problem: open toolkit decisions may require engrenage changes; none is a requirement yet, and each is settled in its toolkit issue first.
  - Export check in CI (AUAUST/lib-js-toolkit#110 question 6): if the barrel check joins the shared CI sequence, engrenage's script setup and generated workflows include it.
  - Build-time stripping of helper metadata (AUAUST/lib-js-toolkit#116 question 1, option A): runtime metadata objects must never reach the bundle; a tsdown plugin in engrenage's builder is one option. Optional compile-time erasure of identity looseners (AUAUST/lib-js-toolkit#149 question 5) would use the same mechanism.
  - Translation injection (AUAUST/lib-js-toolkit#119 question 3): injecting translations without bundling them by default may need a build plugin.
  - Build output defects (toolkit backlog `merge.18`, `merge.19`): empty module entries emit `.d.mts` files that fail `typecheck:dist`, and the root namespace object differs from the module entry's namespace in `dist/`. Both come from the tsdown and rolldown-plugin-dts output engrenage's builder configures. The namespace defect is tracked by #116.
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

- Matter: toolkit's `ProtocolRegistry` (`src/modules/protocol/types/ProtocolRegistry.ts`) keys entries by `Symbol.dispose` and `Symbol.asyncDispose` and uses the global `Disposable` and `AsyncDisposable`. Against the src tsconfig of a `2026-10` baseline (`typescript-baseline-lib/year/2023`, with the inherited `lib` reset since `typescript.5` was fixed), `tsc` reports TS2550 for both symbols and TS2304 for both types, plus TS2550 for `Math.f16round` (`src/modules/math/utils/f16round.ts`). No year of the installed `typescript-baseline-lib` (2020 to 2025) declares explicit resource management, since it is not Baseline widely available.
- Answers to the investigation:
  1. Toolkit's declarations do not interfere with the inferred globals: `ProtocolRegistry` is a plain exported interface, with no `declare global` or augmentation of `SymbolConstructor`; it only reads the globals, so it fails where they are missing instead of overriding them.
  2. Toolkit cannot rely on the 2023 baseline for these keys. Declaring them itself (`declare global` with `readonly dispose: unique symbol` on `SymbolConstructor` and a `Disposable` interface) compiles and merges silently with a consumer lib that already has them (checked with `tsc` against `esnext`), but it ships a global augmentation that tells every consumer the runtime has `Symbol.dispose`, even on targets without it. Workable options: (a) leave the disposal protocols out of `ProtocolRegistry` until the baseline includes them; (b) add them conditionally, inferring the symbol from the global (`SymbolConstructor extends { readonly dispose: infer Key extends symbol } ? … : {}`) with inline shapes instead of the `Disposable` names, which compiles against both `es2023` and `esnext`; (c) the global augmentation above, accepting the unsound claim; (d) list the protocol through `src.tsconfig.types` from a package that declares it (for example `@types/node` or a future engrenage `src.apis` group), which widens the globals beyond the baseline.
  3. In the published `.d.mts`, the computed key `[Symbol.dispose]` and the `Disposable` name stay references to ambient globals, so they resolve against the consumer's own lib: a consumer whose lib declares explicit resource management gets the same symbol as its own code; one whose lib lacks it gets the same errors in toolkit's declarations (hidden only by `skipLibCheck`). Option (b) keeps both cases clean.
- Remaining: toolkit chooses between the options in its own backlog; nothing changes in engrenage unless toolkit picks (d) through a new `src.apis` group.
- Done when toolkit records its choice, or a requirement on engrenage is written as its own entry.
