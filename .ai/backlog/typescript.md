# typescript

Generated tsconfigs: checks, variant resolution and shipped type declarations.

## 1. Generate the `src.apis` declarations at build time instead of committing them.

- why: `pnpm support codegen apis` commits generated copies of TypeScript's `lib.dom.d.ts` subsets in `data/apis/`. Generating them into `dist` during the build, from entrypoints referencing TypeScript's lib, would commit no generated file and follow the installed TypeScript on each release. Only a quick look was taken during #101: it needs a build hook that reads `typescript` (a devDependency, not a runtime one) and an export mapping for `dist`, and was not clearly simple.
- done: the idea is adopted (and `--check` plus the `data/apis/` generated files are removed) or rejected with a reason.

## 2. Several `src.apis` groups are not generated yet.

- why: #101 generates `timers`, `performance`, `crypto`, `console`, `url`, `encoding`, `events`, `abort`, `exceptions`, `microtasks`, `streams`, `compression` and `blob` from `lib.dom.d.ts`. Not generated: `structuredClone`, `fetch` (`Request`, `Response`, `Headers`, `FormData`), `WebAssembly` (a `declare namespace`, which the generator does not index) and messaging (`MessageChannel`, `MessagePort`, `MessageEvent`), because their closure from `lib.dom.d.ts` is the whole DOM (about 37,800 lines, via `Transferable` and `HTMLFormElement`); `URLPattern`, `navigator`, `WebSocket` and `BroadcastChannel` are also undecided (see the questions of #101). Related: the `url` group includes `URL.createObjectURL` and its browser-only closure from `lib.dom.d.ts`; `crypto` (about 560 lines) and `performance` (about 490 lines) are larger than needed for common use.
- want: options are to read `lib.webworker.d.ts` instead (`fetch` about 1,500 lines, `WebAssembly` about 1,650, `Transferable` still about 7,500), add a stop list with narrowed replacements, or leave them out. Recommended in #101: `lib.webworker.d.ts`, with the stop list decided separately.
- done: each of these APIs is generated, or ruled out.

## 3. Enabling one `src.apis` group declares the globals of the groups it shares types with.

- why: declarations used by several groups live in `data/apis/shared/common.d.ts`, so enabling `url` also declares `ReadableStream` and the other shared roots even when `streams` is not enabled. Types are harmless but the global surface is wider than the selected groups.
- done: shared roots are split so a group declares only its own roots and their closure, or the wider surface is accepted.

## 4. `generateEditions` and `generateApiDeclarations` are monolithic modules.

- why: `scripts/codegen/operations/generateEditions.ts` (578 lines, about 15 functions, its own valibot schemas, patterns, types and file constants, nested callbacks) and `scripts/codegen/operations/generateApiDeclarations.ts` (379 lines, same shape) each own reading `lib.*.d.ts` files, matching, resolving and formatting in one function (`generateEditions.ts:133`), compat-data parsing and validation, name resolution and the file writing in one place, against the project's one-concern-per-module layout. The two define separate private library readers (`readLibraryText` in `generateApiDeclarations`, `parseLibrary` in `generateEditions`) over the same TypeScript lib directory. `generateEditions.ts` is the clearest instance of the problems #141 targets (nested closures, own schemas, constants, types and utilities in one file); it should not have been accepted as is.
- want: a structure separating reading libraries, compat data, candidate-key resolution and writing, with schemas, types and constants in their own modules and the shared reading in one place.
- done: neither module mixes these concerns and no nesting beyond one callback level remains.

## 5. `esMemberCompatKeys` is a hand-maintained table of about 60 near-duplicate entries.

- why: `scripts/codegen/constants.ts` (`esMemberCompatKeys`, carrying a `@debt` marker), consumed by `scripts/codegen/operations/generateEditions.ts`; twenty `X.@@toStringTag` entries map to one key (`constants.ts:18`). `generateEditions` fails with "add it to `esMemberCompatKeys` or `esInterfaceAliases`" whenever a new lib declaration has no web-features key, so the table is edited by hand after each failure. Entries repeat one key per interface (for example every `X.@@toStringTag` and the `Intl.NumberFormatPartTypeRegistry.*` members) and the long compat paths are repeated verbatim. It reads as generated data in disguise; if it cannot be derived, its maintenance should still be automated to avoid manual errors.
- want: candidate answers: group entries by pattern or by interface so each key is stated once; or move the table next to the generated `src/project/baseline/editions/constants.ts` source data; or derive more keys from web-features in `generateEditions` so fewer need listing. Whether the table can be generated at all is open and needs a look at how web-features names these members.
- done: the table is grouped or derived so each key appears once and maintaining it needs no per-interface duplication.

## 6. ES library selection and baseline month logic rest on assumptions

- sites: `src/tools/typescript/operations/produceTsconfigTypes.ts:47`, `:87`, `src/project/baseline/utils/{includesEsLibrary.ts:5,listEsSelections.ts:13,addMonths.ts:5}`, `src/project/baseline/entry.ts:1`, `scripts/codegen/operations/generateApiDeclarations.ts:231`
- why: `esnext.*`, `ESNext`, `DOM` never count as a group; candidate months follow the selection rule, not the selection; lib name from the `lib.<name>.d.ts` convention; `addMonths` can return 2026-02-31; the removed prefix is stated apart from `listDefaultTypes`; `./baseline` exposes `addMonths`, `findCurrentMonth`, `listEsSelections`, which no consumer imports; the `editions` type repeats in three modules.
- want: lib name declared beside its group; one source for type prefixes; valid dates; candidates from the selection; the entry trimmed to consumed helpers.

## 7. Baseline and edition generation depend on upstream conventions

- sites: `src/project/baseline/utils/resolveBaselineMinimums.ts:8` (V8 versions follow Chromium majors), `:25` (first match relies on `node-releases` ascending order), `scripts/codegen/operations/generateEditions.ts:317` (base edition trusted as TypeScript ships it).
- want: mapping read from a source stating it; first match chosen by version; decide on the base-edition trust (planning).

## 8. Timer handle types are not isomorphic

- site: `src/project/baseline/constants.ts:3`
- why: handles typed `number` (DOM) while Node returns an object. Related: `typescript.2`, `typescript.3`.
- want: a type holding under both signatures.

## 9. Module-level compiler and tsconfig state keeps past results

- sites: `src/tools/typescript/operations/createLibraryCompiler.ts:41`, `src/project/tsconfig/config/sections/tsconfigSection.ts:11`
- why: the shared compiler host is a mutable binding valid only while compilations stay synchronous; the tsconfig memo key holds only the base tsconfig content, so staged changes to an extended local tsconfig go unseen within a pass.
- want: per-compilation host state; memo keys covering every extended file.

## 10. Library names use lowercase, not TypeScript's Pascal casing

- why: libs are written `es2023.array` where TypeScript's own naming is `ES2023.Array`.
- want: a decision on `ES2023.Array` as the canonical form in options and generated data, with case-insensitive reading if kept compatible.

## 11. TypeScript producers special-case targets

- sites: `src/tools/typescript/operations/tsconfigProducers.ts:15`, `src/tools/typescript/setup/syncTsconfigFiles.ts:48`, `src/tools/typescript/operations/resolveTsconfigEnvironments.ts:13`
- why: most producers open with `key === "base"`; `tests.dist` does not fit the config shape, so it is special-cased in producers and `createResolvedConfig`; producers compute inherited `tests.dist` fields that sync then drops.
- want: base and environment producers split, or declared targets; one tsconfig-key-to-config-path lookup; inherited fields skipped.

## 12. Removed generated tsconfig keys stay in the files

- sites: `src/tools/typescript/setup/syncAliases.ts:114`, `src/tools/typescript/setup/syncTsconfigFiles.ts:206`
- why: removed bundler aliases stay in `paths` (only `#` keys are known generated); a removed compiler option stays and `sync --check` passes.
- want: generated keys recorded, so removals are deleted and checked.

## 13. Barrels are hand-filled and read by index

- sites: `src/tools/typescript/operations/syncBarrels.ts:147`, `:231`
- why: names travel in a parallel array read by index with a `""` fallback; tooling and tests barrels are never discovered.
- want: `nameModules` returns module–name pairs; barrels discovered in every environment.

## 14. Tsconfig include misses nested role files

- site: `src/tools/typescript/operations/produceTsconfigInclude.ts:64`
- why: role files matched only at the root of tests directories, so deeper declarations miss the dist check.
- want: nested role files included.
