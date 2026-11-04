# Debt

Intake queue of the debt found by `@debt` markers in the code, organised by kind of debt. An entry is removed once a backlog entry or GitHub issue tracks it, or once its fix lands. Markers stay in the code until then.

## 1. The "No package.json found" guard is repeated in six modules

- `src/workflows/cli/operations/createStepContext.ts:66`
- `src/tools/tsdown/operations/createTsdownConfig.ts:144`
- `src/tools/changesets/setup/syncChangesetConfig.ts:53`
- `src/tools/pnpm/setup/createPnpmStep.ts:27`
- `bin/engrenage/pnpm/upgrade.ts:48`
- also: the `describeMissing` accessor of `src/project/config/utils/createAccessors.ts`
- why: each checks that the resolved config has a package.json and throws the same error.
- want: the resolved config exposes a required package.json path.

## 2. Subprocess and pnpm invocations are hand-written in several places

- `bin/engrenage/init.ts:59`
- `src/tools/changesets/setup/createChangesetConfigStep.ts:15`
- `src/workflows/cli/operations/createStepContext.ts:138`
- `src/tools/pnpm/operations/installDependencies.ts:4`
- `src/tools/pnpm/operations/resolveLatestPnpm.ts:12`
- also: `invokeCommand` in `bin/engrenage/init.ts`, `src/tools/agents/operations/formatEditedFile.ts`
- why: callers check the spawn error and status of `spawnProcess` by hand, and build pnpm commands themselves.
- want: `spawnProcess` owns the check; `tools/pnpm` owns pnpm invocations.

## 3. Version parsing is split across modules

- `scripts/pnpm.ts:6`
- also: `src/project/package/utils/{parseMajorVersion,compareVersions,readProjectPnpmMajor,readProjectPnpmVersion}.ts`, `src/tools/pnpm/operations/resolvePnpmRangeStatus.ts`, `src/tools/pnpm/operations/resolveLatestPnpm.ts`
- why: versions are split by hand next to `compareVersions` and `parseMajorVersion`. Related: `toolkit.9` (`semver` domain).
- want: one version parser yielding major, minor and patch.

## 4. The reference marker syntax is hand-written and conflicts go unreported

- `src/tools/agents/setup/createBacklogStep.ts:69`
- `src/tools/agents/setup/syncAgentFiles.ts:36`
- also: `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates`
- why: `markdownBlocks` already describes the syntax; #9 (one marker grammar, silent failures) covers part of it.
- want: the backlogger decides whether to fold it into #9.

## 5. Casts and assertions that typing could remove

- `scripts/codegen/generateConfigTypes.ts:206`
- `src/tools/eslint/conventions/stylistic/noReturnUndefined.ts:67`
- `src/tools/eslint/conventions/stylistic/preferValuedReturn.ts:106`
- `src/tools/eslint/utils/createBoundaryRule.ts:11`
- `src/project/tsconfig/operations/readTsconfigPaths.ts:14`
- `src/project/config/utils/createAccessors.ts:40`
- also, unmarked: `src/project/presets/utils/resolveTraits.ts:17`, `scripts/codegen/generateEditions.ts:299`, `:321`, `src/tools/eslint/conventions/imports/noExternalNamespace.ts:37`
- why: `coding-style.2` tracks `createAccessors`, `noExternalNamespace` and `generateEditions`; the rest is untracked.

## 6. Modules sit outside their layer's contract

- `src/index.ts:7`: the root entry imports foundation and project modules directly instead of through their `index.ts`, which the environment-root rule allows only for public surfaces.
- `src/project/config/utils/createAccessors.ts:7`: generic accessor factory in `project/config`, used by `createTsconfig` and the package.json model; could live in `foundation`.
- why: related `structure.16` (`createContext`, same directory, also generic).

## 7. `@auaust/engrenage/config` exports more than its contract

- `src/project/config/index.ts:1`
- why: #154 limited the entry to `defineConfig`, `ConfigInput` and `Resolvable`; it still exports `createContext`, `define`, `PackageJson` and many resolved types. Removing them is breaking. Placement of `createContext` is open in `structure.16`.
- want: the entry exports only its contract, with a changeset.

## 8. Config declarations state defaults they do not own or did not verify

- `src/project/config/config/declareManagedList.ts:21`
- `src/project/structure/operations/resolveEnvironmentStructure.ts:198`
- `src/tools/github/config/schemas/githubSchema.ts:15`
- `src/project/environments/config/schemas/binSchema.ts:27`
- `src/project/environments/config/schemas/testsSchema.ts:72`
- `src/project/tsconfig/config/declareEnvironmentTsconfig.ts:91`
- why: the first three document a default computed elsewhere (`structure.15`); the last three are unverified.
- want: a worker runs the unverified behavior and corrects the text.

## 9. `tests.dist` is special-cased across tsconfig code

- `src/project/tsconfig/setup/syncTsconfigFiles.ts:50`
- `src/project/tsconfig/operations/resolveTsconfigEnvironments.ts:14`
- also: the extends, paths and `skipLibCheck` producers
- why: `structure.15` tracks the raw-input read of its default.
- want: one lookup from tsconfig key to environment, with the fields each variant inherits.

## 10. Tsconfig producers repeat guards and conversions

- `src/project/tsconfig/operations/tsconfigProducers.ts:15`
- `src/project/tsconfig/utils/toJsonValue.ts:3`
- `src/project/tsconfig/operations/resolveTsconfigLibrary.ts:6`
- want: directly fixable by a worker.

## 11. Tsconfig sync keeps entries removed from the config

- `src/project/tsconfig/setup/syncTsconfigFiles.ts:184`: `compilerOptions`; `sync --check` still passes.
- `src/tools/typescript/setup/syncAliases.ts:93`: bundler aliases in `paths`.
- why: sync cannot tell entries it wrote from hand-written ones. Adjacent: #59.
- want: a design for knowing which entries sync owns.

## 12. ES library selection rests on assumptions

- `src/project/tsconfig/operations/produceTsconfigTypes.ts:36`
- `src/project/tsconfig/operations/produceTsconfigTypes.ts:76`
- `src/project/baseline/operations/includesEsLibrary.ts:5`
- `src/project/baseline/operations/listEsSelections.ts:13`
- `src/project/baseline/utils/addMonths.ts:5`
- `scripts/codegen/generateApiDeclarations.ts:358`
- why: related `typescript.3`, `typescript.4`, `typescript.5`.

## 13. Baseline and edition generation depend on upstream conventions

- `src/project/baseline/utils/resolveBaselineMinimums.ts:8`: V8 follows Chromium majors.
- `src/project/baseline/utils/resolveBaselineMinimums.ts:25`: `node-releases` ascending order.
- `scripts/codegen/generateEditions.ts:548`: TypeScript base editions consistent.
- want: a planning decision: a validating check or accepting each assumption.

## 14. Checks and processes give unsound or leaking results

- `bin/engrenage/eslint.ts:12`: per-file cache. Open: disable it for checks, or a cache strategy.
- `src/workflows/cli/operations/defineToolCommands.ts:48`
- `src/tools/typescript/operations/createLibraryCompiler.ts:41`
- `src/project/config/operations/createProjectSections.ts:231`
- `src/tools/pnpm/operations/resolvePnpmRangeStatus.ts:22`
- why: adjacent: #57.
- want: a debugger takes `eslint.ts:12` and `defineToolCommands.ts:48`.

## 15. CLI and config code guard or redo work instead of owning it

- `src/workflows/cli/operations/runProgram.ts:17`: resolves the config again after a failure.
- `src/workflows/cli/operations/defineCommand.ts:6`: guards `--debug` against double registration.
- `src/project/build/config/schemas/buildSchema.ts:28`: `resolveWithin` called only for its throw.
- want: directly fixable by a worker.

## 16. `build.outDir` resolution depends on parsing the tsconfig

- `src/project/config/operations/createProjectSections.ts:638`: an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped.
- `src/project/config/operations/createProjectSections.ts:708`: `build.outDir` resolves on access, unlike other sections.
- why: its computed default reads the tsconfig. `structure.9` tracks `produceTsconfigOutDir` re-validating `raw.build`.
- want: the output directory resolves without parsing the tsconfig.

## 17. Vitest options replace or hide defaults

- `src/tools/vitest/config/schemas/optionsSchema.ts:4`: shared workers break `vi.mock`. Open: the default.
- `src/tools/vitest/config/schemas/optionsSchema.ts:7`
- `src/tools/vitest/config/schemas/optionsSchema.ts:9`
- `src/tools/vitest/operations/createVitestConfig.ts:92`

## 18. The test suite silences, hard-codes and skips

- `tests/setup.ts:6`
- `tests/scripts/codegen/generateApiDeclarations.test.src.ts:24`
- `tests/utils/binaryTimeout.ts:1`
- `src/project/build/operations/createEmittedManifest.ts:28`
- why: related `configuration.2` (timeouts not configurable).

## 19. Generated tsconfig paths miss `@auaust/engrenage/agents/constants`

- `tests/src/foundation/blocks/syncBlocks.test.src.ts:5`
- why: the paths resolve it to `agents/*/index.ts` instead of `agents/constants.ts`, though `package.json` exports `./agents/constants`; the test stays source-only.
- want: a debugger fixes the paths generation; the test then runs through the public entry.

## 20. Tsdown config and entry self-references

- `src/tools/tsdown/operations/createTsdownConfig.ts:195`: repeated `=== undefined` checks instead of a "prop if defined" helper; placement (`src/utils` or toolkit) is a decision.
- `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:12`: the package specifier is rebuilt from the entry name; `PathAlias` should carry it.
- `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:39`: declarations stay bundled because rolldown-plugin-dts keeps externalized `import()` types verbatim; needs an upstream fix.

## 21. Timer handle types are not isomorphic

- `src/project/baseline/constants.ts:3`
- why: handles are typed `number` (DOM) while Node returns an object. Related: `typescript.3`, `typescript.4`.

## 22. `formatContent` needs its formatter passed by every caller

- `src/project/format/operations/formatContent.ts:5`
- why: `project` cannot import `tools`, so the Prettier adapter is not bound; #154 planned `formatContent(content, { path, root })`.
- want: a decision on where the adapter is bound (planning).

## 23. Nested workflows are relocated by string substitution

- `src/tools/github/operations/renderWorkflow.ts:9`
- why: regex replacements on the templates silently stop matching when a template changes.
- want: template the YAML instead.

## 24. The project map is long and written by `sync` only

- `src/tools/agents/utils/renderProjectMap.ts:288`
- why: per-domain peer and lower-layer target lists make about 580 lines loaded at every session start; a project that ran `init` without `sync` has no map. Check against #151 before filing.

## 25. ESLint convention internals have local gaps

- `src/tools/eslint/conventions/stylistic/naming.ts:27`: splits words by hand; consider primitive-kit's `splitWords`.
- `src/tools/eslint/conventions/stylistic/preferValuedReturn.ts:142`: the fix hardcodes a two-space indent instead of deriving it from the source.
- want: directly fixable by a worker.

## Tracked elsewhere (no separate entry)

- `scripts/codegen/constants.ts:18`: `typescript.6`.
- `scripts/codegen/generateEditions.ts:369`: `typescript.5`.
- `src/project/config/config/declareList.ts:11`: `structure.2`.
- `src/project/config/operations/createProjectSections.ts:309`: `structure.15`.
- `src/project/tsconfig/operations/produceTsconfigOutDir.ts:46`, `src/tools/eslint/operations/createEslintConfig.ts:11`: `structure.9`.
- `src/tools/eslint/operations/createEslintConfig.ts:32`: `structure.16`.
- `src/foundation/json/types/JsonIndentation.ts:1`, `src/project/format/constants.ts:15`: `format.2`.
- `src/tools/agents/utils/parseGithubCommand.ts:24`, `:46`: `agent-instructions.5`.
- `src/tools/typescript/operations/createLibraryCompiler.ts:146`: `primitive-kit.1`; the marker adds `createLibraryCompiler` and `generateApiDeclarations` as sites.
