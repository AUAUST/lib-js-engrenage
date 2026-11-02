# typescript

Generated tsconfigs: checks, variant resolution and shipped type declarations.

## 1. `engrenage typecheck` throws when no active environment owns a checked tsconfig.

- Where: `hasReferencedEnvironment` in `bin/engrenage/tsc.ts`, added with #69.
- Matter: `engrenage typecheck` now throws "No environment is referenced by the base tsconfig: every active environment has `check: false`" when no active environment owns a tsconfig with `check` true. The check runs unconditionally, so a hand-written tsconfig in a project with no active engrenage environments (no `src`, `tests`, etc.) now fails `typecheck`. Issue #69's wording supports the throw, but it is a behavior change.
- Decision: keep it as is, scope it (for example only when at least one environment is active), or document it.
- Done when the decision is taken and the behavior matches it, with a test covering a project without active environments.

## 2. Generate the `src.apis` declarations at build time.

- Matter: `pnpm support codegen apis` commits generated copies of TypeScript's `lib.dom.d.ts` subsets in `data/apis/`. An alternative is to generate them into `dist` during the build, from entrypoints referencing TypeScript's lib, so no generated file is committed and each release follows the installed TypeScript. Only a quick look was taken during #101: it needs a build hook that reads `typescript` (a devDependency, not a runtime one) and an export mapping for `dist`, and was not clearly simple.
- Done when the idea is either adopted (and `--check` plus `data/apis/` generated files are removed) or rejected with a reason.

## 3. `src.apis` groups not generated yet.

- Matter: #101 generates `timers`, `performance`, `crypto`, `console`, `url`, `encoding`, `events`, `abort`, `exceptions`, `microtasks`, `streams`, `compression` and `blob` from `lib.dom.d.ts`. Not generated: `structuredClone`, `fetch` (`Request`, `Response`, `Headers`, `FormData`), `WebAssembly` (a `declare namespace`, which the generator does not index) and messaging (`MessageChannel`, `MessagePort`, `MessageEvent`), because their closure from `lib.dom.d.ts` is the whole DOM (about 37,800 lines, via `Transferable` and `HTMLFormElement`); `URLPattern`, `navigator`, `WebSocket` and `BroadcastChannel` are also undecided (see the questions of #101).
- Options: read `lib.webworker.d.ts` instead (`fetch` about 1,500 lines, `WebAssembly` about 1,650, `Transferable` still about 7,500), add a stop list with narrowed replacements, or leave them out. Recommended in #101: `lib.webworker.d.ts`, with the stop list decided separately.
- Related: the `url` group includes `URL.createObjectURL` and its browser-only closure from `lib.dom.d.ts`; `crypto` (about 560 lines) and `performance` (about 490 lines) are larger than needed for common use.
- Done when each of these APIs is generated, or ruled out.

## 4. Enabling one `src.apis` group declares the globals of the groups it shares types with.

- Matter: declarations used by several groups live in `data/apis/shared/common.d.ts`, so enabling `url` also declares `ReadableStream` and the other shared roots even when `streams` is not enabled. Types are harmless but the global surface is wider than the selected groups.
- Done when shared roots are split so a group declares only its own roots and their closure, or the wider surface is accepted.
