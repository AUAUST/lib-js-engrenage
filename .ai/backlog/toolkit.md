# toolkit

Upstream @auaust/toolkit decisions that may affect engrenage.

## 1. Pending toolkit decisions that may need engrenage support.

- Problem: open toolkit decisions may require engrenage changes; none is a requirement yet, and each is settled in its toolkit issue first.
  - Export check in CI (AUAUST/lib-js-toolkit#110 question 6): if the barrel check joins the shared CI sequence, engrenage's script setup and generated workflows include it.
  - Build-time stripping of helper metadata (AUAUST/lib-js-toolkit#116 question 1, option A): runtime metadata objects must never reach the bundle; a tsdown plugin in engrenage's builder is one option. Optional compile-time erasure of identity looseners (AUAUST/lib-js-toolkit#149 question 5) would use the same mechanism.
  - Translation injection (AUAUST/lib-js-toolkit#119 question 3): injecting translations without bundling them by default may need a build plugin.
  - Build output defects (toolkit backlog `merge.18`, `merge.19`): empty module entries emit `.d.mts` files that fail `typecheck:dist`, and the root namespace object differs from the module entry's namespace in `dist/`. Both come from the tsdown and rolldown-plugin-dts output engrenage's builder configures. The namespace defect is also tracked as `tsdown.2`.
- Done when each decision states whether engrenage must change, and the resulting requirements are separate entries.

## 2. `empty` does not exclude `undefined` in its negative guard.

- Problem: with `const value = [] as string[] | undefined`, `if (!empty(value))` narrows to `(string[] & []) | undefined`, so `undefined` is not excluded. Expected `string[]` (ideally `[string, ...string[]]`).
- Context: bug report for `@auaust/toolkit` `empty`; to be reported upstream.
- Done when the guard narrows as expected in a released toolkit version.

## 3. No `RegExp.escape` substitute, and engrenage pins `node: 24` meanwhile.

- Problem: `@auaust/toolkit` has no regex domain exposing `RegExp.escape`, which is not widely available until `ES2025` is standard.
- Expected: a toolkit regex domain with an `escape` method. Once it is available, engrenage drops the `node: 24` option in `engrenage.config.ts` and relies on its own default again.
- Done when the toolkit exposes `escape` and `engrenage.config.ts` no longer sets `node`.

## 4. Toolkit's `Symbol.dispose` and `Disposable` declarations against the generated baseline types.

- Matter: engrenage infers global protocols automatically from the baseline, and toolkit declares its own types on top. In the current state, `[Symbol.dispose]: Disposable;` fails because the 2023 baseline does not type it, so toolkit may be forced to rely on newer native types.
- Questions to investigate:
  1. Do toolkit's custom declarations interfere with or override the inferred global protocols?
  2. Can toolkit rely on the baseline at all, and if not, what is the workaround?
  3. With all types properly defined, do toolkit's `Symbol.dispose` and `Disposable` work with a consuming library's own `Symbol.dispose`? As ambient types they should resolve from the consumer's context; verify.
- Done when each question is answered and any resulting change is recorded in the owning entry.
