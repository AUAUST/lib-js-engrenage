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

## 5. `syncEditions` and `syncApiDeclarations` are monolithic modules.

- Where: `src/typescript/utils/syncEditions.ts` (585 lines, about 15 functions, its own valibot schemas, patterns, types and file constants, nested callbacks) and `src/typescript/utils/syncApiDeclarations.ts` (405 lines, same shape).
- Problem: each module owns reading `lib.*.d.ts` files, compat-data parsing and validation, name resolution and the file writing in one place. The two define separate private `readLibrary` functions over the same TypeScript lib directory. This is the opposite of the project's one-concern-per-module layout.
- Expected: a structure that separates reading libraries, compat data, candidate-key resolution and writing, with schemas, types and constants in their own modules and the shared reading in one place.
- Illustrative case: `syncEditions.ts` is the clearest instance of the problems `source-structure.1` targets (nested closures, own schemas, constants, types and utilities in one file); it should not have been accepted as is.
- Open: the split follows from the `source-structure.1` classification; design it together or after it.
- Done when neither module mixes these concerns and no nesting beyond one callback level remains.

## 6. `esMemberCompatKeys` is a hand-maintained table of about 60 near-duplicate entries.

- Where: `src/typescript/constants.ts` (`esMemberCompatKeys`, carrying a `@debt` marker), consumed by `src/typescript/utils/syncEditions.ts`.
- Problem: `syncEditions` fails with "add it to `esMemberCompatKeys` or `esInterfaceAliases`" whenever a new lib declaration has no web-features key, so the table is edited by hand after each failure. Entries repeat one key per interface (for example every `X.@@toStringTag` and the `Intl.NumberFormatPartTypeRegistry.*` members) and the long compat paths are repeated verbatim.
- Candidate answers: group entries by pattern or by interface so each key is stated once; or move the table next to the generated `src/typescript/generated/editions.ts` source data; or derive more keys from web-features in `syncEditions` so fewer need listing. Whether the table can be generated at all is open and needs a look at how web-features names these members. The table reads as generated data in disguise; if it cannot be derived, its maintenance should still be automated to avoid manual errors.
- Done when the table is grouped or derived so each key appears once and maintaining it needs no per-interface duplication.

## 7. No canonical key ordering for generated tsconfigs.

- Matter: `package.json` has a canonical field order; tsconfigs have none.
- Expected: a canonical ordering for tsconfig keys (top-level and `compilerOptions`), applied by the sync target, like the `package.json` one.
- Done when generated tsconfigs follow the documented order and sync keeps it.
