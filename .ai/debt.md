# Debt

Intake queue of the debt found by `@debt` markers in the code, organised by kind of debt. An entry is removed once a backlog entry or GitHub issue tracks it, or once its fix lands. Markers stay in the code until then.

## 1. The "No package.json found" guard is repeated in five modules

- `src/workflows/cli/operations/createStepContext.ts:65`
- `src/tools/tsdown/operations/createTsdownConfig.ts:150`
- `src/tools/changesets/setup/syncChangesetConfig.ts:52`
- `src/tools/pnpm/setup/createPnpmStep.ts:29`
- `bin/engrenage/pnpm/upgrade.ts:45`
- also: `describeMissing` of `createPackageJson`
- why: each checks that the resolved config has a package.json and throws the same error.
- want: the resolved config exposes a required package.json path.

## 2. Subprocess and pnpm invocations are hand-written in several places

- `bin/engrenage/init.ts:59`
- `src/tools/changesets/setup/createChangesetConfigStep.ts:15`
- `src/workflows/cli/operations/createStepContext.ts:137`
- `src/tools/pnpm/operations/installDependencies.ts:4`
- `src/tools/pnpm/operations/resolveLatestPnpm.ts:12`
- also: `invokeCommand` in `bin/engrenage/init.ts`
- why: callers check the spawn error and status of `spawnProcess` by hand, and build pnpm commands themselves.
- want: `spawnProcess` owns the check; `tools/pnpm` owns pnpm invocations.

## 3. Version parsing is split, and unparseable pnpm ranges count as in range

- `scripts/pnpm.ts:6`
- `src/tools/pnpm/utils/resolvePnpmRangeStatus.ts:24`
- also: `src/project/package/utils/{parseMajorVersion,compareVersions,readProjectPnpmMajor,readProjectPnpmVersion}.ts`, `src/tools/pnpm/operations/resolveLatestPnpm.ts`
- why: versions are split by hand; an unparseable specifier passes the range check instead of being reported.
- want: one version parser yielding major, minor and patch; an unparseable specifier is an error.

## 4. The reference marker syntax is hand-written and conflicts go unreported

- `src/tools/agents/setup/createBacklogStep.ts:69`
- `src/tools/agents/setup/syncAgentFiles.ts:35`
- also: `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse)
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. Partly tracked by open issue #9 (silent failures).
- want: one marker grammar from `markdownBlocks`; sync reports the conflict.

## 5. Config declarations state defaults they do not own or did not verify

- `src/foundation/options/config/declareManagedList.ts:21`
- `src/project/config/operations/createProjectSections.ts:335`
- `src/project/environments/config/schemas/binSchema.ts:31`
- `src/project/environments/config/schemas/testsSchema.ts:76`
- `src/project/tsconfig/config/declareEnvironmentTsconfig.ts:93`
- `src/tools/github/config/schemas/githubSchema.ts:13`
- why: the defaults are computed elsewhere, so the declaration only documents them; three claims were written from reading the code and were never run. The explicitness check reads the raw input because a resolved option cannot tell a default from a given value.
- want: a worker runs the unverified behaviour and corrects the text; the tests.dist default depends on its published trait in its declaration.

## 6. `tests.dist` is special-cased across tsconfig code

- `src/project/tsconfig/setup/syncTsconfigFiles.ts:49`
- `src/project/tsconfig/operations/resolveTsconfigEnvironments.ts:14`
- also: the extends, paths and skipLibCheck producers, and `createResolvedConfig`
- why: `tests.dist` does not fit the config shape; producers compute its fields as for `tests`, then sync drops the ones it inherits.
- want: one lookup from tsconfig key to environment, with the fields each variant inherits.

## 7. Tsconfig producers repeat guards and conversions

- `src/project/tsconfig/operations/tsconfigProducers.ts:15`
- `src/project/tsconfig/utils/toJsonValue.ts:3`
- why: most producers open with the same `key === "base"` early return; the JSON round-trip duplicates `serialize` in `defineSchema`.
- want: split base and environment producers, or declare the targets each producer applies to; one shared JSON-value converter.

## 8. Tsconfig and alias sync keep entries removed from the config

- `src/project/tsconfig/setup/syncTsconfigFiles.ts:183`: `compilerOptions`; `sync --check` still passes.
- `src/tools/typescript/setup/syncAliases.ts:94`: bundler aliases in `paths`.
- why: only `#` keys are known to be generated, so sync cannot tell its entries from hand-written ones.
- want: a design for knowing which entries sync owns (planning).

## 9. ES library selection and baseline month logic rest on assumptions

- `src/project/tsconfig/operations/produceTsconfigTypes.ts:35`
- `src/project/tsconfig/operations/produceTsconfigTypes.ts:75`
- `src/project/baseline/utils/includesEsLibrary.ts:5`
- `src/project/baseline/utils/listEsSelections.ts:13`
- `src/project/baseline/utils/addMonths.ts:5`
- `scripts/codegen/operations/generateApiDeclarations.ts:358`
- why: an unknown lib (`esnext.*`, `DOM`) never counts as including a group; the candidate months follow the selection rule, not the selection; the lib name comes from the file-name convention; `addMonths` can return impossible dates such as 2026-02-31; the removed prefix is stated apart from `listDefaultTypes`.
- want: a validating check or an explicit declaration per assumption. Related: `typescript.3`, `typescript.4`, `typescript.5` in the backlog.

## 10. Baseline and edition generation depend on upstream conventions

- `src/project/baseline/utils/resolveBaselineMinimums.ts:8`: V8 versions follow Chromium majors.
- `src/project/baseline/utils/resolveBaselineMinimums.ts:25`: first match relies on `node-releases` ascending order.
- `scripts/codegen/operations/generateEditions.ts:548`: the base edition is trusted as TypeScript ships it.
- why: each holds only while the upstream keeps its convention.
- want: a planning decision: a validating check or accepting each assumption.

## 11. Checks and processes give unsound or leaking results

- `bin/engrenage/eslint.ts:12`: per-file cache; type-aware rules keep passing a file whose imported types changed.
- `src/workflows/cli/operations/defineToolCommands.ts:47`: the child is never killed when its caller gives up, so it sets the exit code later.
- `src/tools/typescript/operations/createLibraryCompiler.ts:41`: the running compilation's sources sit in a shared mutable binding that holds only while compilations stay synchronous.
- want: a debugger takes `eslint.ts:12` (checks pass `--no-cache` today) and `defineToolCommands.ts:47`. Adjacent: open issue #58.

## 12. CLI and config code guard or redo work instead of owning it

- `src/workflows/cli/operations/runProgram.ts:17`: resolves the config again after a failure.
- `src/workflows/cli/operations/defineCommand.ts:6`: guards `--debug` against double registration.
- `src/workflows/cli/operations/registerSubcommands.ts:7`: eager registration coexists with `registerLazySubcommands`, so two contracts register subcommands.
- `src/project/build/config/schemas/buildSchema.ts:29`: `resolveWithin` called only for its throw.
- want: directly fixable by a worker, except the registration contract, which needs a decision.

## 13. `build.outDir` resolution depends on parsing the tsconfig

- `src/project/config/operations/createProjectSections.ts:670`: an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped.
- `src/project/config/operations/createProjectSections.ts:740`: resolved on access, unlike other sections.
- `src/project/tsconfig/operations/produceTsconfigOutDir.ts:45`: the raw `build` section is validated again.
- why: the computed default reads the tsconfig, which can fail to parse.
- want: the output directory resolves without parsing the tsconfig; the resolved build section exposes it.

## 14. Vitest options replace or hide defaults

- `src/tools/vitest/config/schemas/optionsSchema.ts:4`: shared workers break `vi.mock` for consumers; whichever file runs first fixes the module graph.
- `src/tools/vitest/config/schemas/optionsSchema.ts:7`: `guardOutDir` switches a built-in plugin by flag, not by name.
- `src/tools/vitest/config/schemas/optionsSchema.ts:9`: `setupFiles` replaces the discovered setup files instead of adding to them.
- `src/tools/vitest/operations/createVitestConfig.ts:94`: `include` replaces the default, so `.js` and `.mjs` tests are no longer collected.
- want: a decision on the shared-workers default; the rest is directly fixable.

## 15. The test suite silences every warning and leaves build hooks untested

- `tests/setup.ts:6`: every warning is silenced, unexpected ones included.
- `src/project/build/operations/createEmittedManifest.ts:27`: the plugin hooks wrapping it in tsdown and Vite are untested; no test runs a real build with `clean: "emitted"`.
- want: route warnings through a logger that lets tests silence only the expected ones.

## 16. Generated tsconfig paths miss `@auaust/engrenage/agents/constants`

- `tests/src/foundation/blocks/syncBlocks.test.src.ts:5`
- why: the paths resolve it to `agents/*/index.ts` instead of `agents/constants.ts`, though `package.json` exports `./agents/constants`.
- want: a debugger fixes the paths generation; the test then runs through the public entry. The source-only test is tracked by `structure.22`.

## 17. Tsdown config and entry self-references are hand-built

- `src/tools/tsdown/operations/createTsdownConfig.ts:201`: repeated `=== undefined` checks instead of a "prop if defined" helper; its placement (`src/utils` or toolkit) is a decision.
- `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:12`: the package specifier is rebuilt from the entry name; `PathAlias` should carry it.
- `src/tools/tsdown/plugins/createEntrySelfReferencesPlugins.ts:39`: declarations stay bundled because rolldown-plugin-dts keeps externalized `import()` types verbatim; needs an upstream fix.

## 18. Timer handle types are not isomorphic

- `src/project/baseline/constants.ts:3`
- why: handles are typed `number` (DOM) while Node returns an object.
- want: a type that holds under both signatures. Related: `typescript.3`, `typescript.4`.

## 19. `formatContent` needs its formatter passed by every caller

- `src/project/format/operations/formatContent.ts:5`
- why: `project` cannot import `tools`, so the Prettier adapter is not bound.
- want: a decision on where the adapter is bound (planning).

## 20. Nested workflows are relocated by string substitution

- `src/tools/github/operations/renderWorkflow.ts:9`
- why: regex replacements on the templates silently stop matching when a template changes.
- want: template the YAML instead.

## 21. ESLint convention internals have local gaps

- `src/tools/eslint/conventions/stylistic/naming.ts:27`: splits words by hand; consider primitive-kit's `splitWords`.
- `src/tools/eslint/conventions/stylistic/preferValuedReturn.ts:142`: the fix hardcodes a two-space indent instead of deriving it from the source.
- `src/tools/eslint/constants.ts:203`: the key of the index role repeats the one in `project/structure`, which a utility cannot import at runtime.
- want: directly fixable by a worker, except the key, which needs a shared home (planning).

## 22. Schema and declarer helpers sit in the wrong modules

- `src/foundation/options/config/declareLocation.ts:9`: declarers are split by their imports, not by concern.
- `src/foundation/options/index.ts:52`: `globsSchema.ts` exports `globSchema` besides its named export, which no barrel can expose.
- `src/foundation/options/utils/createAccessors.ts:7`: a generic accessor factory used by the tsconfig and package.json models.
- `src/project/structure/config/schemas/structureOptions.ts:12`: a spreadable record of declarations in the `schemas` role; neither a schema nor named like one.
- want: each declarer and schema in the module its concern names; `globSchema` in its own module.

## 23. `resolveListOption` warns on the console and twice per run

- `src/foundation/options/config/declareList.ts:11`: a pure function warns on the console.
- `src/project/tsconfig/operations/resolveTsconfigLibrary.ts:6`: both producers call it, so the warning can print twice.
- want: the warning leaves the function and is raised once per config.

## 24. Project config caches go stale or load the file twice

- `src/project/config/operations/createProjectSections.ts:247`: the memo key holds only the base tsconfig content, so staged changes to a local tsconfig it extends are not seen within a pass.
- `src/project/config/operations/readConfig.ts:7`: duplicates `workflows/registry` `readConfig` and `loadConfig` with a second cache and no schema validation.
- why: tool definers read an unvalidated partial config, and a process may load the file twice. Adjacent: open issue #57.
- want: one config loader with validation and one cache owner.

## 25. `define` stays in `project/config`, so its tests run from source only

- `src/project/config/utils/define.ts:7`
- why: `define` needs internals that `project/config` does not export; the public-specifier tests that used them became source-only.
- want: a placement that lets the tests reach the public entry.

## 26. Terms carry the wrong domain's meaning

- `src/project/config/constants.ts:22`: test-variant suffixes belong to `project/environments`; `liveSections` is a registry concept.
- `src/project/environments/config/declareProgramLayout.ts:5`: `layout` means `commands | domains` here and `roots | mirror` in `tests`.
- `src/project/structure/operations/resolveImportRules.ts:72`: environment-sourced rules are labelled `test-variant` instead of `environment`.
- want: each term and constant owned by its domain, with one meaning per name.

## 27. Lint rules and messages understate or miss what they check

- `src/tools/eslint/conventions/structure/indexDeclarations.ts:31`: `export default <expression>` is never inspected.
- `src/tools/eslint/conventions/structure/roleExports.ts:14`: `bin` has no lint scope, so its command modules are never checked.
- `src/tools/eslint/utils/createBoundaryRule.ts:11`: the package typings describe the default export as the module namespace.
- `src/project/structure/operations/resolveImportRules.ts:542`: the reasons say "through their index.ts" while `surface` also grants public roles.
- want: each rule checks what its message promises. Boundary messages are tracked by `coding-style.3`.

## 28. Agent hooks and marker listing run ESLint heavier than needed

- `src/tools/agents/operations/formatEditedFile.ts:35`: each edit spawns ESLint twice (fix, then lint), each loading the config again; this takes most of the hook's time.
- `src/tools/eslint/operations/listDebtMarkers.ts:30`: markers are listed through the full ESLint config, so files are parsed with type information that comment markers never need.
- want: a single ESLint pass per edit; marker listing without type information.

## 29. ESLint creators read the flat config instead of their sections

- `src/tools/eslint/operations/createEslintConfig.ts:11`: the git section is resolved again from the raw input.
- `src/tools/eslint/operations/createEslintConfig.ts:33`: takes the flat `ProjectConfig`, unlike the tsdown, Vite, Vitest and Prettier creators, which read through `get`; the conventions' `rule` and `delegates` callbacks receive the flat config.
- want: the creator reads its sections through `get`, like the other creators.

## 30. Runtime dependencies are declared by hand

- `src/project/structure/operations/findImportCycles.ts:240`: imports `typescript`, an optional peer; `verbatimModuleSyntax` is assumed on instead of read from the resolved option.
- `tsdown.config.ts:5`: transitive dependencies of commander and @clack are hand-listed and mirrored in `inlinedDependencies`.
- want: the runtime reads its optional peer through a checked path; bundling brings its own dependency closure.

## 31. Comments explain code instead of naming it

- `src/workflows/registry/config/schemas/configDeclaration.ts:24`: the `Core`, `Tooling` and `Environments` comments explain the code.
- `tests/utils/binaryTimeout.ts:1`: the comment below explains the code instead of the name carrying it.
- want: names carry the meaning; the comments are removed.

## 32. Bin commands hold logic that belongs in `src`

- `bin/engrenage/structure.ts:8`: composes the structure check (report, cycles, exit) from four internal modules of `project/structure`.
- `bin/engrenage/sync.ts:36`: sync orchestration lives in a command module and is imported by `init` and by a `project/workspaces` test; it belongs in `workflows/sync`.
- why: bin may reach any internal, so its "thin" rule has no lint backing.
- want: orchestration moves to `src`; bin keeps argument parsing only.

## 33. Config roles and generated-file declarations in `engrenage.config.ts` are unclear

- `engrenage.config.ts:5`: these roles are defined for every environment, so scripts, tests and tooling maps list roles none of their modules can use.
- `engrenage.config.ts:101`: the list of generated files may mean a missing pattern to describe generated files, or that the declaration is unnecessary once they are generated formatted.
- want: a decision on how roles and generated files are declared (planning).
