# typescript

Generated tsconfigs: checks, variant resolution and shipped type declarations.

## 1. `engrenage typecheck` throws when no active environment owns a checked tsconfig.

- why: `hasReferencedEnvironment` in `bin/engrenage/tsc.ts` (added with #69) throws "No environment is referenced by the base tsconfig: every active environment has `check: false`" when no active environment owns a tsconfig with `check` true. It runs unconditionally, so a hand-written tsconfig in a project with no active engrenage environments (no `src`, `tests`, etc.) now fails `typecheck`. Issue #69's wording supports the throw, but it is a behavior change.
- want: a decision: keep it as is, scope it (for example only when at least one environment is active), or document it.
- done: the behavior matches the decision, with a test covering a project without active environments.

## 2. Generate the `src.apis` declarations at build time instead of committing them.

- why: `pnpm support codegen apis` commits generated copies of TypeScript's `lib.dom.d.ts` subsets in `data/apis/`. Generating them into `dist` during the build, from entrypoints referencing TypeScript's lib, would commit no generated file and follow the installed TypeScript on each release. Only a quick look was taken during #101: it needs a build hook that reads `typescript` (a devDependency, not a runtime one) and an export mapping for `dist`, and was not clearly simple.
- done: the idea is adopted (and `--check` plus the `data/apis/` generated files are removed) or rejected with a reason.

## 3. Several `src.apis` groups are not generated yet.

- why: #101 generates `timers`, `performance`, `crypto`, `console`, `url`, `encoding`, `events`, `abort`, `exceptions`, `microtasks`, `streams`, `compression` and `blob` from `lib.dom.d.ts`. Not generated: `structuredClone`, `fetch` (`Request`, `Response`, `Headers`, `FormData`), `WebAssembly` (a `declare namespace`, which the generator does not index) and messaging (`MessageChannel`, `MessagePort`, `MessageEvent`), because their closure from `lib.dom.d.ts` is the whole DOM (about 37,800 lines, via `Transferable` and `HTMLFormElement`); `URLPattern`, `navigator`, `WebSocket` and `BroadcastChannel` are also undecided (see the questions of #101). Related: the `url` group includes `URL.createObjectURL` and its browser-only closure from `lib.dom.d.ts`; `crypto` (about 560 lines) and `performance` (about 490 lines) are larger than needed for common use.
- want: options are to read `lib.webworker.d.ts` instead (`fetch` about 1,500 lines, `WebAssembly` about 1,650, `Transferable` still about 7,500), add a stop list with narrowed replacements, or leave them out. Recommended in #101: `lib.webworker.d.ts`, with the stop list decided separately.
- done: each of these APIs is generated, or ruled out.

## 4. Enabling one `src.apis` group declares the globals of the groups it shares types with.

- why: declarations used by several groups live in `data/apis/shared/common.d.ts`, so enabling `url` also declares `ReadableStream` and the other shared roots even when `streams` is not enabled. Types are harmless but the global surface is wider than the selected groups.
- done: shared roots are split so a group declares only its own roots and their closure, or the wider surface is accepted.

## 5. `generateEditions` and `generateApiDeclarations` are monolithic modules.

- why: `scripts/codegen/generateEditions.ts` (578 lines, about 15 functions, its own valibot schemas, patterns, types and file constants, nested callbacks) and `scripts/codegen/generateApiDeclarations.ts` (379 lines, same shape) each own reading `lib.*.d.ts` files, compat-data parsing and validation, name resolution and the file writing in one place, against the project's one-concern-per-module layout. The two define separate private library readers (`readLibraryText` in `generateApiDeclarations`, `parseLibrary` in `generateEditions`) over the same TypeScript lib directory. `generateEditions.ts` is the clearest instance of the problems #141 targets (nested closures, own schemas, constants, types and utilities in one file); it should not have been accepted as is.
- want: a structure separating reading libraries, compat data, candidate-key resolution and writing, with schemas, types and constants in their own modules and the shared reading in one place.
- done: neither module mixes these concerns and no nesting beyond one callback level remains.

## 6. `esMemberCompatKeys` is a hand-maintained table of about 60 near-duplicate entries.

- why: `scripts/codegen/constants.ts` (`esMemberCompatKeys`, carrying a `@debt` marker), consumed by `scripts/codegen/generateEditions.ts`. `generateEditions` fails with "add it to `esMemberCompatKeys` or `esInterfaceAliases`" whenever a new lib declaration has no web-features key, so the table is edited by hand after each failure. Entries repeat one key per interface (for example every `X.@@toStringTag` and the `Intl.NumberFormatPartTypeRegistry.*` members) and the long compat paths are repeated verbatim. It reads as generated data in disguise; if it cannot be derived, its maintenance should still be automated to avoid manual errors.
- want: candidate answers: group entries by pattern or by interface so each key is stated once; or move the table next to the generated `src/project/baseline/editions/constants.ts` source data; or derive more keys from web-features in `generateEditions` so fewer need listing. Whether the table can be generated at all is open and needs a look at how web-features names these members.
- done: the table is grouped or derived so each key appears once and maintaining it needs no per-interface duplication.

## 7. ES library selection and baseline month logic rest on assumptions

- sites: `src/project/tsconfig/operations/produceTsconfigTypes.ts:35,75`, `src/project/baseline/utils/{includesEsLibrary.ts:5,listEsSelections.ts:13,addMonths.ts:5}`, `scripts/codegen/operations/generateApiDeclarations.ts:358`.
- why: an unknown lib (`esnext.*`, `DOM`) never counts as including a group; candidate months follow the selection rule, not the selection; lib name comes from file-name convention; `addMonths` can return impossible dates (2026-02-31); the removed prefix is stated apart from `listDefaultTypes`. Related: `typescript.3`–`typescript.5`.
- want: a validating check or explicit declaration per assumption.

## 8. Baseline and edition generation depend on upstream conventions

- sites: `src/project/baseline/utils/resolveBaselineMinimums.ts:8` (V8 versions follow Chromium majors), `:25` (first match relies on `node-releases` ascending order), `scripts/codegen/operations/generateEditions.ts:548` (base edition trusted as TypeScript ships it).
- want: decide per assumption: a validating check or acceptance (planning).

## 9. Timer handle types are not isomorphic

- site: `src/project/baseline/constants.ts:3`
- why: handles typed `number` (DOM) while Node returns an object. Related: `typescript.3`, `typescript.4`.
- want: a type holding under both signatures.

## 10. The library compiler keeps sources in a shared mutable binding

- site: `src/tools/typescript/operations/createLibraryCompiler.ts:41`
- why: holds only while compilations stay synchronous.
- want: per-compilation state (debugging).
