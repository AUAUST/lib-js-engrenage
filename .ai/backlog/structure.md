# structure

Project structure description, its report and the tooling generated from it.

## 1. `engrenage structure` prints text only (#156), not machine-readable data.

- why: editor integrations would need it as data.
- want: a `--json` flag printing the resolved structure with each directory's classification and source.
- done: a consumer needs it and the flag exists.

## 2. Naming rules of the roles are broken by many modules.

- why: #141 findings.
  - `produceTsconfig*` (12 modules) and `tsconfigProducers` sit in `operations/`; `produce` is not among the verbs of the decisions and no role fits better.
  - `defineConvention` and other convention `define*` builders (`tools/eslint/utils/`) break "`define…Config` for definers only".
  - `sync…` is for sync targets only, yet `syncBlocks`, `syncFiles`, `syncIgnoreFile`, `syncFrontmatter`, `syncEditHook`, `syncCodexInstructions` and `syncBarrels` are not targets; `syncBarrels` is public API of `@auaust/engrenage/typescript`, so renaming it is breaking.
  - `TsconfigEnvironment` (exported by `project/config`) still permutes `EnvironmentTsconfig`; renaming it is breaking.
- also: `src/foundation/data/index.ts`: a one-function domain named like the `data` environment it resolves files of.
- want: a decision per group: amend the naming rule or rename.
- done: names and rules agree.

## 3. The `conventions` role in `engrenage.config.ts` is unscoped.

- why: namespace `roles.enable` only accepts catalogue roles.
- want: scope the role to its namespace, or document why it cannot be.

## 4. Roles for step adapters and non-tool sync targets are undefined (#143)

- why: `createPrompter` (adapter of the `Prompter` port) stays in `workflows/cli/operations`, `workflows/sync` has no `adapters/` role to take it; `syncPackageJson`, a sync target of no tool, went to `workflows/sync/setup/`; the plan names only "init and sync step contracts" for `project/steps`, yet `Prompter` and `Invocation` live there.
- want: decide whether `workflows` domains get `adapters/` and whether `setup/` may hold targets of no tool; state `project/steps` content.
- done: the roles and the plan agree.

## 5. Config helpers and shared inline types have no home (#143)

- why: plan `Config` is "one getter per section", yet `root`, `resolve`, `cacheFor`, `filesystem` and `configFile` are not sections and `get` currently reaches them; `resolve(...paths: string[]): string` repeats inline in about 10 agents signatures with no shared type allowed; `ResolvedAgents` (`tools/agents/types`) derives `Agent` from `preferredSchema` in `project/config`, so type and schema sit in different domains.
- also: `src/constants.ts` carries tool knowledge (package and config file names) and `project/package` vocabulary (`packageTypes`, `publishAccess`); `src/entry.ts`: the global types role holds domain vocabulary (block types, sync results, `PackageType`, `PublishAccess`, `IgnorePresets`, `GlobGroup`) their owners should hold.
- want: decide whether helpers are sections, a separate `context`, or `Config` members; where shared argument shapes live.
- done: the plan states it and the code follows.

## 6. Interfaces implemented elsewhere may be ports, not types

- why: `src/foundation/filesystem/types/Filesystem.ts`, `FileFormatter.ts` and `src/project/steps/types/Prompter.ts` state an interface that another domain implements (`createPrompter`); #154 made `Formatter` a port in `src/project/format/ports/`, which is what `ports/` and `adapters/` are for; they sit in `types/`. Other interfaces injected by `workflows` may be the same.
- want: review which `types/` modules are ports (interface injected, implemented by an adapter in another domain) and whether the decisions' "contract domains declare ports" applies beyond `project/build`; then relocate or state why not.
- done: every injected interface is a port or has a stated reason not to be.

## 7. Config registry gaps found in #143 round 3

- why: `configDeclaration` groups "Core", "Tooling" and "Environments" sections in one declaration with no counterpart in the target layout; `generateConfigTypes` lives in `project/config/operations` but needs the registry once tool schemas leave `project/config`; `createSections` has no per-section raw-validation hook for eager validation (step 5); `packageJsonPath`, `packageJson`, `tsconfig` and `environment` stay live because `init` stages changes in the filesystem.
- want: place the declaration, the generator and the validation hook; decide whether the live sections can be keyed on file content.
- done: the registry has no live exceptions and each piece has an owner.

## 8. Config registry leftovers from #143 round 4

- why: `define` and `cache` schemas have no project domain (`project/config`, `project/environments` or `project/build` are candidates); `typescript` is a `ProjectConfig` section while `tools/typescript` consumes it, unstated in the plan; `liveSections` is a concept the plan does not name; `get(section)` is also used in `createProjectSections` helpers, beyond the plan's "definers, domain resolvers and steps"; `createPrettierFormatter` is injected only by the registry; each section is validated twice (registry, then `resolveSection`); `readRawConfig` accepts any plain-object default export; ESLint re-resolves `git` from raw input and `produceTsconfigOutDir` re-validates `raw.build`.
- also: `src/project/config/constants.ts`: `liveSections` is imported by `workflows/registry`, a registry concept kept in config constants.
- want: place the schemas, name or remove the live concept, settle validation once per section.
- done: each piece has an owner and no section is validated twice.

## 9. Environment schemas are composed in `project/environments`, not the registry (#143)

- why: the partial `loadConfig` resolves them; `exposedFilesSchema` moved to `project/package/config/schemas`, a `config/` role that domain did not have. `ConfigInput` and `defineConfig` are placed by #196.
- want: decide where the environment composition belongs; amend the plan wording.
- done: the composition sits with its consumer's layer or the exception is stated.

## 10. Hook vocabulary and GitHub command logic have no home (#172)

- why: `HookEvent`, `HookDefinition` and `BudgetMode` sit in `tools/agents/types/` though hook-sync vocabulary is shared by `agents/claude` and `agents/codex` and the map has no home for code shared by both; `parseGithubCommand` and `measureGithubCommand` are GitHub-command logic in `agents/utils` (`tools/github/utils` cannot be imported by a `tools` peer); `getEntryBudgetKind` hard-codes the `.ai/backlog` layout with `debtFile`, split from `createBacklogStep`.
- want: a home for code shared by the agent sub-domains, a rule for logic about another tool's commands, one owner of the backlog layout.
- done: each piece has one owner.

## 11. Generator wiring is hand-listed (#147)

- why: the `generated` globs list `Rules.ts` and `rules/**` by hand while `ConfigInput.ts` and `editions/constants.ts` are generated but not listed (the generators format them); `scripts/codegen/index.ts` runs generators in a hard-coded order (`editions, apis, config, rules, barrels`) derived from nothing.
- also: `engrenage.config.ts` generated-files list: may mean a missing pattern for generated files, or be unnecessary once generated files are formatted.
- want: derive the globs and the order from the generators.
- done: adding a generator needs no second list.

## 12. Trait vocabulary has no declared homes (#153)

- why: `resolveTraits` sits in `project/presets/utils/` (pure) though "owns composition and derivation" could mean `operations/`; `traitAdjustments` is exposed on `ProjectConfig` only so init can recompute traits, and no role covers state a step context must re-derive; `WorkflowSet.trait` and `Convention.traits` are tool-side declarations depending on a `project/presets` type, with no stated home for trait requirements of tool artefacts; `testsDistTsconfig` reads the raw input because a resolved option cannot tell a default from a given value (`declareObject` needs to allow a `false` default).
- want: state where trait requirements of tool artefacts live, and give declarations computed defaults.
- done: no section reads raw input to tell defaults from given values.

## 13. Context, format and mapping helpers lack homes (#153)

- why: `createContext` (flat config → `OptionContext`, public in `@auaust/engrenage/config`) sits in `project/config/utils/` though it is generic (`foundation/options/` or an `operations/` role fit); `project/format` gained a `config/schemas/` role; `mapConventions` is a pure mapping in `tools/prettier/utils/` (`config/` is a candidate); the ESLint creator and the conventions' public `rule(config)` and `delegates(config)` callbacks still take the flat `ProjectConfig`.
- sites: `src/tools/eslint/operations/createEslintConfig.ts:11` (resolves `git` again from raw input) and `:33` (flat `ProjectConfig`, unlike the tsdown, Vite, Vitest and Prettier creators reading through `get`).
- want: place `createContext`, decide where tool mappings of conventions live, and move the ESLint creator and convention callbacks to `get`.
- done: no creator takes the flat config.

## 14. No way to detect unused code

- why: ESLint's `no-unused-vars` sees only file-local symbols; exported symbols never imported, and symbols reachable only through cycles, need a cross-file reference graph (ESLint alone cannot build it; the TypeScript language service or a tool like knip can).
- want: a `structure` subcommand or health-check command reporting, per symbol, one of: local and unused; exported and re-exported from an entrypoint only (matched through `export { x } from` or `export *`; not used as code); exported and never referenced. Used symbols are not reported; test usage does not count. Ideally also report symbols unreachable from every public entrypoint by traversing references from the entrypoints (cycles unreachable from a root included).
- done: the command runs, with a report in the spirit of the structure report.

## 15. `discovered` (role, `<env>.discovered`, `files.discovered`) loses its only lint consumer in #150

- why: #150 step 3 removes `noDefaultExport`, the sole reader, and enforces `exports`; `discovered` then only feeds the project map, duplicating `exports: "default"` (`setup.ts`, loaded by path, is the exception). `configuration.4` concerns the widening. `stylistic/naming`, `padded*` and `debtMarkers` derive from no structure.
- want: decide whether `discovered` goes from roles and config; state a reason for each non-structure rule.

## 16. Domains carry no `purpose`, so the maps list bare names

- why: `domains.<path>.purpose` exists but none is set; the src map shows about forty names (`steps`, `data`, `blocks`, `presets`) an agent must open to place code; the structure section requires purposes only for declared domains, and all are inferred.
- also: `engrenage.config.ts` `./config` entry resolving to `workflows/config` but `./config/constants` to `project/config` (`configuration.6`).
- want: a purpose per domain, required by `structure --check` in strict environments.
- done: every domain line of every map carries a purpose.

## 17. Effect levels have no stated meaning; roles are picked by what a module imports

- why: maps name `pure < confined < effectful` without defining them; lint ranks only imports and the fixed `effectfulModules` list, so mutation, console output and unlisted packages are unranked; declarers split between `config/` and `utils/`, `ensureAnyOf` sits in `operations/`; catalogue `schemas` is pure yet overridden confined, `adapters` has no level.
- also: `src/project/structure/constants.ts` (index role without level, schemas role pure yet its consumer overrides it confined, the hand-picked external-module list); `src/workflows/cli/operations/ensureAnyOf.ts` (mutation: an effect or not).
- want: one definition per level in catalogue and map, catalogue defaults that fit, a decision on mutation and console.
- done: placement follows the definition and `engrenage.config.ts` overrides no level.

## 18. Role contracts overlap or misname their content

- why: `operations` = impure logic + definers; `config` holds the declarers (`foundation/options`) and nests as `project/config/config`; `conventions` are ESLint rules called formatting conventions; `setup.ts` vs `setup`; tests `utils` keeps the "Confined" purpose; src-only roles apply to scripts, tests and tooling.
- also: `engrenage.config.ts` role overrides (roles defined for every environment, so scripts, tests and tooling maps list roles none of their modules can use; `config` role named like its domain; `conventions`; `tests/utils` purpose); `setup.ts` role key carries its extension (`src/project/structure/constants.ts`). Roles per environment: decision.
- want: true purposes, definers in one role, per-environment role sets, a test-setup name without extension.
- done: each role's purpose holds for every module in it.

## 19. Public domains have two hand-synced surfaces

- why: `index.ts` whole-role barrels export everything (`./baseline` publishes `addMonths`); `entry.ts` lists are hand-written and unchecked against `index.ts`; Prettier's default export runs from `index.ts`; the root entry publishes internal domains.
- also: `src/project/baseline/entry.ts` exposes `addMonths`, `findCurrentMonth`, `listEsSelections` as API; `src/entry.ts` publishes functions of internal domains (`foundation/blocks`, `foundation/filesystem`, `foundation/options`, `workflows/registry`); `src/tools/prettier/index.ts` default export runs at import (`format.3`).
- want: one source of publicity (a `public` list per domain, or a tag) generating `entry.ts`, and `index.ts` barrels limited to what other domains import.
- done: a public export is declared once and drift fails a check.

## 20. Config stays two aggregates under three `config` names

- why: `createProjectSections` (850 lines) resolves every `project` section; `project/config` re-exports six domains' types; `ProjectConfig` and `Config` each have `readConfig`, `loadConfig` and a cache, and definers read the unvalidated one; `project/config`, `workflows/config` and `workflows/registry` share the concern. Details: `structure.7`–`structure.9`, `structure.13`.
- also: `src/project/config/index.ts` re-exports types of six domains; `src/workflows/config/index.ts` is a third `config` home; `src/workflows/registry/config/schemas/configSchema.ts` is a one-line module re-exposing `configDeclaration.schema` (read it from the declaration); `createProjectSections.ts` (850 lines); loader duplication: `configuration.11`.
- want: domains contribute section resolvers, the registry composes them, one loader; merge `workflows/config` into the registry.
- done: no domain imports every peer and one `loadConfig` exists.

## 21. Generated aliases exceed what import rules allow

- why: `#src/*` gives every src module a second specifier; every root file gets one (`#entry`, which nothing may import); `bin` and `scripts` reach any internal through `#…/operations/…`, so "thin bin" has no lint backing (`runSync` and the structure check live in bin).
- also: `bin/engrenage/structure.ts:8` composes the structure check from four internals of `project/structure`; `bin/engrenage/sync.ts:36` holds sync orchestration imported by `init` and a `project/workspaces` test, so it belongs in `workflows/sync`; `resolveAliases.ts` (`#entry`, `#src/*`). want: orchestration to `src`, bin keeps argument parsing.
- want: aliases derived from the import rules, and bin and scripts limited to domain surfaces.
- done: each alias has an allowed importer and bin imports only surfaces.

## 22. Tests lean on source mode and mirror only directories

- why: 78 `.src`, 34 plain and no `.dist` test; most public behavior is tested through internals, so dist mode covers little; the mirror layout checks directories, not that a test exercises its domain (`resolveListOption` under `project/config`); `tests/bin` is flat while bin is a tree.
- also: `tests/src/project/config/resolveListOption.test.src.ts` tests `foundation/options` from the `project/config` mirror; `configuration.12`, `typescript.13`.
- want: plain public-specifier tests wherever an entry exposes the behavior, a lint check matching a test's directory to the domain it imports, `tests/bin` mirroring the tree.
- done: every public entry runs in dist mode and misplaced tests fail lint.

## 23. Terms carry the wrong domain's meaning

- sites: `src/project/config/constants.ts:22` (test-variant suffixes belong to `project/environments`; `liveSections`: `structure.8`), `src/project/environments/config/declareProgramLayout.ts:5` (`layout` means `commands | domains` here, `roots | mirror` in `tests`; `configuration.6`), `src/project/structure/operations/resolveImportRules.ts:72` (environment-sourced rules labelled `test-variant` instead of `environment`).
- want: each term and constant owned by its domain, one meaning per name.

## 24. `findImportCycles` imports `typescript`, an optional peer

- site: `src/project/structure/operations/findImportCycles.ts:240`
- why: `verbatimModuleSyntax` is assumed on instead of read from the resolved option.
- want: the runtime reads its optional peer through a checked path.
