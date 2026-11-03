# Debt

Intake queue of the debt found by `@debt` markers in the code, organised by kind of debt. An entry is removed once a backlog entry or GitHub issue tracks it, or once its fix lands. Markers stay in the code until then.

## 1. The "No package.json found" guard is repeated in six modules

- `src/support/scaffold/utils/createStepContext.ts:61`
- `src/tsdown/config/createTsdownConfig.ts:83`
- `src/changesets/setup/syncChangesetConfig.ts:52`
- `src/pnpm/setup/createPnpmStep.ts:19`
- `bin/engrenage/pnpm/upgrade.ts:48`
- also: `createPackageJson`'s `describeMissing` (named by the marker at `createStepContext.ts:61`)
- why: each checks that the resolved config has a package.json and throws the same error.
- want: the resolved config exposes a required package.json path (or a helper throws once).

## 2. Subprocess and pnpm invocations are hand-written in several places

- `bin/engrenage/init.ts:89`
- `src/changesets/setup/createChangesetConfigStep.ts:15`
- `src/support/scaffold/utils/createStepContext.ts:127`
- `src/pnpm/utils/installDependencies.ts:5`
- `src/pnpm/utils/resolveLatestPnpm.ts:13`
- also: other `spawnSync` users found by search, `src/support/commander/utils/resolveBinary.ts`, `src/agents/utils/formatEditedFile.ts`
- why: pnpm is spawned and its status checked by hand in each site instead of one shared subprocess helper owned by the pnpm entry.
- want: one subprocess helper (spawn, check status, report) and pnpm invocations owned by `src/pnpm`.

## 3. Version parsing is split across modules

- `scripts/support/pnpm.ts:6`
- also: `src/support/packageJson/utils/parseMajorVersion.ts`, `src/support/packageJson/utils/compareVersions.ts`, `src/pnpm/utils/resolvePnpmRangeStatus.ts`, `src/support/packageJson/utils/readProjectPnpmMajor.ts`, `src/pnpm/utils/resolveLatestPnpm.ts`
- why: versions are split by hand next to `compareVersions` and `parseMajorVersion` instead of one parser yielding major, minor and patch. Related: the `semver` domain idea of `toolkit.9`.
- want: one version parser module.

## 4. Engrenage's own data files are located by repeated `createRequire` resolution

- `src/agents/setup/createBacklogStep.ts:51`
- also: `src/agents/codex/setup/createCodexStep.ts`, `src/agents/setup/createAgentsStep.ts`, `src/agents/utils/getInstructionTemplates.ts`, `src/github/utils/renderWorkflow.ts`, `src/typescript/utils/resolveTsconfigPresets.ts`; `src/prettier/utils/loadPrettier.ts` and the `syncEditions`/`syncApiDeclarations` modules also use `createRequire`, probably for other purposes (to check)
- why: related: GitHub issue #9 notes `createRequire` resolves references with CommonJS conditions.
- want: one helper owns resolution of the package's data files.

## 5. The reference marker syntax is hand-written and conflicts go unreported

- `src/agents/setup/createBacklogStep.ts:67`
- `src/agents/setup/syncAgentFiles.ts:32`
- also: `src/agents/utils/getRuleReferences.ts`, `src/agents/utils/createInstructionFile.ts`, `src/agents/setup/createAgentsStep.ts`
- why: the `<!-- @reference … -->` syntax is written by hand in `createBacklogStep`, `createAgentsStep` and `createInstructionFile`, and re-parsed by a regex in `getMissingRuleTemplates`, although `markdownBlocks` already describes it. Separately, a project file at a wanted rule's path without its reference silently keeps the rule out of sync, with no conflict report. GitHub issue #9 (one marker grammar, markers failing silently) covers part of this; the conflict report may fit it.
- want: the backlogger decides whether to fold it into #9.

## 6. Casts and assertions that typing could remove

- `src/config/utils/syncConfigTypes.ts:208`: valibot draft 07 JSON schema asserted to the draft 04 type of json-schema-to-typescript-lite (differs only by numeric exclusive bounds).
- `src/eslint/conventions/stylistic/noReturnUndefined.ts:67`: rule typed on ESLint core ESTree nodes, so the return type is probed with `in` instead of typescript-eslint nodes.
- `src/eslint/conventions/stylistic/preferValuedReturn.ts:106`: cast and redundant `node.type` check from the visitor parameter widened to `Rule.Node`; type the listener on `BlockStatement`.
- `src/typescript/setup/produceTsconfigPaths.ts:24`: hand-written paths cast instead of validated against a schema.
- `src/config/utils/resolveTsconfigOwner.ts:22`: the `in` check does not narrow `key`; type `defaultTsconfigInherits` as `Partial<Record<TsconfigKey, TsconfigKey>>`.
- `src/config/utils/resolveTsconfigOwner.ts:49`: non-null assertion on `chain.at(-2)`; track the previous key.
- `src/config/utils/createAccessors.ts:40`: double cast because `compose` cannot type getters from a dynamic resolver map.
- why: `coding-style.2` already tracks the last three (`resolveTsconfigOwner`, `createAccessors`); these markers add the exact fixes (the `Partial<Record>` typing at line 22 is not in that entry). The four first sites are not tracked.

## 7. Misplaced modules

- `src/config/utils/createAccessors.ts:7`: generic accessor factory in the config entry, used by `createTsconfig` and the support package.json model; could live under `src/support`.
- `src/support/debt/constants.ts:1`: debt markers belong to the eslint tool and their only consumer is the `debtMarkers` convention; move to `src/eslint/constants.ts` or inline it.
- why: #139 (relocation) and #141 (modules sorted into roles) subsume these.

## 8. Config schema descriptions are unverified or hand-synced with defaults

- `src/config/config/schemas/environments/testsSchema.ts:25`: hand-synced; derive from constants.
- `src/config/config/schemas/tools/typescriptSchema.ts:91`: hand-synced; derive from constants.
- `src/config/config/schemas/environments/binSchema.ts:35`: unverified ("engines.node floor").
- `src/config/config/schemas/environments/environmentTsconfigSchema.ts:142`: unverified (unmanaged description).
- `src/config/config/schemas/environments/testsSchema.ts:71`: unverified (`tests.dist` tsconfig default).
- why: descriptions state defaults in words and are hand-synced with their constants, or were written from reading the code without running it.
- want: a worker or debugger runs the behavior and confirms or corrects the unverified text.

## 9. `tests.dist` and variant handling is special-cased across tsconfig code

- `src/typescript/setup/syncTsconfigFiles.ts:48`
- `src/typescript/utils/resolveTsconfigEnvironments.ts:14`
- why: `tests.dist` does not fit the config shape, so it is special-cased in `syncTsconfigFiles`, `createResolvedConfig`, `resolveTsconfigEnvironments` and the extends, paths and `skipLibCheck` producers. Producers also compute `tests.dist` fields as if it were `tests` and `syncTsconfigFiles` then drops the inherited ones. #143 and `typescript.1` touch the same resolution; design needed.
- want: a single lookup from tsconfig key to environment, and knowledge of which fields a variant inherits.

## 10. Tsconfig producer and sync gaps

- `src/typescript/setup/tsconfigProducers.ts:14`: most producers open with the same `key === "base"` early return; split base and environment producers or declare the targets of each.
- `src/typescript/setup/syncTsconfigFiles.ts:201`: configured `compilerOptions` are only ever set; one removed from the config stays in the tsconfig file and `sync --check` still passes (a behavior bug of sync).
- `src/typescript/setup/syncTsconfigFiles.ts:165`: same JSON round-trip as `serialize` in `defineSchema`; one shared JSON-value converter could serve both. Also benefiting: `src/config/utils/syncConfigTypes.ts`.
- `src/typescript/utils/resolveTsconfigLibrary.ts:6`: both tsconfig producers call it, so a `resolveListOption` warning for `<env>.tsconfig.lib` can print twice.
- want: the backlogger files the `syncTsconfigFiles:201` bug; the others are directly fixable.

## 11. ES library selection logic rests on assumptions

- `src/typescript/setup/produceTsconfigTypes.ts:36`: `includesEsLibrary` only knows generated editions; unknown libs (`esnext.*`, `ESNext`, `DOM`) never count as including a group.
- `src/typescript/setup/produceTsconfigTypes.ts:76`: the removed prefix is stated apart from what `listDefaultTypes` writes, so a new baseline type kind must be added in both places.
- `src/typescript/utils/includesEsLibrary.ts:5`: the `editions` parameter type is repeated in three modules, and an edition key in the selection is assumed to be its base.
- `src/typescript/utils/listEsSelections.ts:13`: candidate months derive from the selection rule, not from the selection, so a rule change must be mirrored.
- `src/typescript/utils/addMonths.ts:5`: the day is kept as is, so the result can be an impossible date (2026-02-31); it only compares correctly as a string.
- `src/typescript/utils/syncApiDeclarations.ts:385`: the lib name is derived from the `lib.<name>.d.ts` file-name convention instead of being declared next to the group.
- why: related `typescript.3`, `typescript.4` and `typescript.5` (`syncEditions`/`syncApiDeclarations` split, also covers the shared program compilation of `syncApiDeclarations.ts:224` and the `library_` naming in `syncEditions.ts:368`).

## 12. Baseline runtime resolution depends on external conventions

- `src/typescript/utils/resolveBaselineMinimums.ts:8`: assumes V8 versions follow Chromium majors (Chromium 138 ships V8 13.8).
- `src/typescript/utils/resolveBaselineMinimums.ts:25`: returns the first match, relying on `node-releases` listing releases in ascending order.
- why: both hold only while upstream conventions stay.
- want: a decision, by planning, on adding a validating check or accepting the assumption.

## 13. Check and runtime behavior is unsound or leaks

- `bin/engrenage/eslint.ts:12`: the ESLint cache is keyed on each file alone, so type-aware rules keep passing a file whose imported types changed; checks must pass `--no-cache` to be sound. Open: choose between disabling the cache for checks and a cache strategy.
- `src/support/commander/utils/defineToolCommands.ts:48`: the child is never killed when its caller gives up (timed-out test), setting the global exit code later and leaking into unrelated tests.
- `src/support/commander/utils/runProgram.ts:17`: resolves the config again after a failure instead of reading the one the failing command resolved.
- `src/support/commander/utils/defineCommand.ts:6`: the existing-option check guards against registering `--debug` twice when nested definitions pass through `defineCommand`, instead of one owner registering it once.
- `src/pnpm/utils/resolvePnpmRangeStatus.ts:22`: an unparseable project or shared pnpm specifier counts as within the range instead of being reported.
- `src/config/utils/createResolvedConfig.ts:164`: the memo key holds the content of the base tsconfig only, so staged changes to a local tsconfig it extends are not seen within a pass.
- `src/config/utils/createResolvedConfig.ts:194`: `resolveWithin` is called only for its throw when the path escapes the root (here and in `cache()`); an explicit assertion would state the intent.
- `src/support/scaffold/utils/createStepContext.ts:158`: spreading the resolved config evaluates all lazy getters on every access, and `setPresets` is not reflected while `setAgents` is.
- why: `createResolvedConfig` size is replaced by the layered registry (#143); issue #57 (long-lived processes keep the first loaded config) is adjacent.
- want: a debugger takes the `eslint.ts:12` cache and `defineToolCommands:48` leak; the others are directly fixable.

## 14. Vitest and test-suite defaults are unsettled

- `src/vitest/config/schemas/optionsSchema.ts:4`: `isolate` defaults to shared workers, which silently breaks `vi.mock` in consumers whose test files load the same modules. Open: choose the default and its documentation (decision needed).
- `src/vitest/config/schemas/optionsSchema.ts:7`: `guardOutDir` switches one built-in plugin through its own flag instead of by plugin name, as the `plugins` option of `defineTsdownConfig` does.
- `tests/setup.ts:6`: every warning is silenced, unexpected ones included; a logger engrenage owns would let tests silence only expected ones.
- why: related #142 (Vitest picks up `setup.ts`).

## 15. Tsdown config and entry self-references

- `src/tsdown/config/createTsdownConfig.ts:121`: repeated `=== undefined` checks instead of a "prop if defined" utility. Candidate for `src/utils` (public helper) or toolkit; placement is a decision.
- `src/tsdown/plugins/createEntrySelfReferencesPlugins.ts:12`: the package specifier is rebuilt from the tsdown entry name; `PathAlias` should carry it so both stay in sync.
- `src/tsdown/plugins/createEntrySelfReferencesPlugins.ts:39`: declarations stay bundled because rolldown-plugin-dts keeps externalized `import()` types verbatim; needs an upstream fix (rolldown-plugin-dts), to be filed as an upstream backlog entry.

## 16. Timer handle types are not isomorphic

- `src/typescript/constants.ts:6`
- why: timer handles are typed `number` (DOM signature) while Node returns an object, so `setTimeout` results differ. Related: `typescript.3` and `typescript.4` (`src.apis` declarations).

## 17. Disabled options are branched on repeatedly in the config resolver

- `src/config/utils/createResolvedConfig.ts:288`: `raw.<option> === false ? … : raw.<option>?.<field>` repeated throughout.
- `src/config/utils/createResolvedConfig.ts:438`: disabled and active branches build the same composed shape twice.
- want: normalize disabled options once; the declaration helper (#146) does this at the boundary and removes both.

## Tracked elsewhere (no separate entry)

- `src/typescript/constants.ts:62` (`X.@@toStringTag` entries): `typescript.6`.
- `src/typescript/utils/syncEditions.ts:368`, `src/typescript/utils/syncApiDeclarations.ts:224`: `typescript.5` (listed under entry 11 for context).
