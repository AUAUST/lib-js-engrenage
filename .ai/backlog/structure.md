# structure

Project structure description, its report and the tooling generated from it.

## 1. `engrenage structure` prints text only (#156), not machine-readable data.

- why: editor integrations would need it as data.
- want: a `--json` flag printing the resolved structure with each directory's classification and source.
- done: a consumer needs it and the flag exists.

## 2. The role import rules are stricter than the code, and some modules fit no role.

- why: #141 findings.
  - Pure functions sit in `operations/` only for their imports: `includesEsLibrary`, `selectEsLibraries`, `listEsSelections` (runtime import of the `baseline/editions` index), `resolveRoles`, `resolveCatalogue` (import a schema), and the `tools/pnpm`, `tsdown`, `tsconfig` utils importing other domains' utils at runtime.
  - `declareList` (`project/config/config/`) is imported by schemas, but depends on `resolveListOption` (`operations/`, `console.warn`), breaking the `config/` import row; marked `@debt`.
  - Mutators of their arguments (`ensureAnyOf`, `ensureIncludes`, `ensureIncludesAll`, `ensureUnset`, `addDebugOption`, `registerSubcommands`, `defineCommand`) went to `operations/`; whether mutation is impure for `utils/` is undecided.
  - `importConfigFile` (c12) and `createLibraryCompiler` (reads libraries from disk) are in `operations/`.
  - `tests/utils/*` spawn processes and touch the filesystem yet sit in the `utils` role.
  - `tools/eslint/constants.ts` imports `#package/constants` and the convention barrels (constants importing across domains).
- want: a decision: relax the `utils/` import row, or move these modules; and whether mutation and test helpers are impure.
- done: rules and code agree.

## 3. Naming rules of the roles are broken by many modules.

- why: #141 findings.
  - `produceTsconfig*` (12 modules) and `tsconfigProducers` sit in `operations/`; `produce` is not among the verbs of the decisions and no role fits better.
  - `defineConvention` and other convention `define*` builders (`tools/eslint/utils/`) break "`define…Config` for definers only".
  - `sync…` is for sync targets only, yet `syncBlocks`, `syncFiles`, `syncIgnoreFile`, `syncFrontmatter`, `syncEditHook`, `syncCodexInstructions` and `syncBarrels` are not targets; `syncBarrels` is public API of `@auaust/engrenage/typescript`, so renaming it is breaking.
  - `TsconfigEnvironment` (exported by `project/config`) still permutes `EnvironmentTsconfig`; renaming it is breaking.
- want: a decision per group: amend the naming rule or rename.
- done: names and rules agree.

## 4. `engrenage structure --check` leaves `scripts/support/**` unclassified.

- done: the structure covers those files or leaves them out on purpose.

## 5. The `conventions` role in `engrenage.config.ts` is unscoped.

- why: namespace `roles.enable` only accepts catalogue roles.
- want: scope the role to its namespace, or document why it cannot be.

## 6. Roles for step adapters and non-tool sync targets are undefined (#143)

- why: `createPrompter` (adapter of the `Prompter` port) stays in `workflows/cli/operations`, `workflows/sync` has no `adapters/` role to take it; `syncPackageJson`, a sync target of no tool, went to `workflows/sync/setup/`; the plan names only "init and sync step contracts" for `project/steps`, yet `Prompter` and `Invocation` live there.
- want: decide whether `workflows` domains get `adapters/` and whether `setup/` may hold targets of no tool; state `project/steps` content.
- done: the roles and the plan agree.

## 7. Config helpers and shared inline types have no home (#143)

- why: plan `Config` is "one getter per section", yet `root`, `resolve`, `cacheFor`, `filesystem` and `configFile` are not sections and `get` currently reaches them; `resolve(...paths: string[]): string` repeats inline in about 10 agents signatures with no shared type allowed; `ResolvedAgents` (`tools/agents/types`) derives `Agent` from `preferredSchema` in `project/config`, so type and schema sit in different domains.
- want: decide whether helpers are sections, a separate `context`, or `Config` members; where shared argument shapes live.
- done: the plan states it and the code follows.

## 8. Interfaces implemented elsewhere may be ports, not types

- why: `foundation/filesystem/types/Filesystem.ts`, `foundation/filesystem/types/Formatter.ts` and `project/steps/types/Prompter.ts` state an interface that another domain implements (`createPrettierFormatter`, `createPrompter`), which is what `ports/` and `adapters/` are for; they sit in `types/`. Other interfaces injected by `workflows` may be the same.
- want: review which `types/` modules are ports (interface injected, implemented by an adapter in another domain) and whether the decisions' "contract domains declare ports" applies beyond `project/build`; then relocate or state why not.
- done: every injected interface is a port or has a stated reason not to be.

## 9. Config registry gaps found in #143 round 3

- why: `configDeclaration` groups "Core", "Tooling" and "Environments" sections in one declaration with no counterpart in the target layout; `generateConfigTypes` lives in `project/config/operations` but needs the registry once tool schemas leave `project/config`; `createSections` has no per-section raw-validation hook for eager validation (step 5); `packageJsonPath`, `packageJson`, `tsconfig` and `environment` stay live because `init` stages changes in the filesystem.
- want: place the declaration, the generator and the validation hook; decide whether the live sections can be keyed on file content.
- done: the registry has no live exceptions and each piece has an owner.

## 10. Config registry leftovers from #143 round 4

- why: `define` and `cache` schemas have no project domain (`project/config`, `project/environments` or `project/build` are candidates); `typescript` is a `ProjectConfig` section while `tools/typescript` consumes it, unstated in the plan; `liveSections` is a concept the plan does not name; `get(section)` is also used in `createProjectSections` helpers, beyond the plan's "definers, domain resolvers and steps"; `createPrettierFormatter` is injected only by the registry; each section is validated twice (registry, then `resolveSection`); `readRawConfig` accepts any plain-object default export; ESLint re-resolves `git` from raw input and `produceTsconfigOutDir` re-validates `raw.build`.
- want: place the schemas, name or remove the live concept, settle validation once per section.
- done: each piece has an owner and no section is validated twice.

## 11. Public tests of sync targets became source-only (#143)

- why: the public `loadConfig` returns `ProjectConfig` only, so the tests of `attribution`, `syncAgentFiles`, `syncClaudeSettings`, `syncCodexFiles`, `syncGitignoreFile`, `syncPrettierignoreFile` and `syncVscodeFiles` moved to `.test.src.ts`, against "whatever is public is tested through its public specifier".
- want: decide how public consumers get the full `Config` (public `workflows/registry`, per-tool loaders, or accept source-only).
- done: public API is tested through public specifiers, or the exception is stated.

## 12. Generated `ConfigInput` and `defineConfig` sit below the registry (#143)

- why: `ConfigInput.ts` is generated into `project/config/types` by the registry's generator (a lower layer holding a higher layer's output); `defineConfig` stays in `project/config` while the registry owns the schema; `exposedFilesSchema` moved to `project/package/config/schemas`, a `config/` role that domain did not have; `define` and `cache` schemas and `declareDefines` have no project domain; environment schemas are composed in `project/environments`, not the registry, because the partial `loadConfig` resolves them.
- want: decide where `ConfigInput` and `defineConfig` live and where the composition belongs; amend the plan wording.
- done: generated output sits with its generator's layer or the exception is stated.

## 13. Hook vocabulary and GitHub command logic have no home (#172)

- why: `HookEvent`, `HookDefinition` and `BudgetMode` sit in `tools/agents/types/` though hook-sync vocabulary is shared by `agents/claude` and `agents/codex` and the map has no home for code shared by both; `parseGithubCommand` and `measureGithubCommand` are GitHub-command logic in `agents/utils` (`tools/github/utils` cannot be imported by a `tools` peer); `getEntryBudgetKind` hard-codes the `.ai/backlog` layout with `debtFile`, split from `createBacklogStep`.
- want: a home for code shared by the agent sub-domains, a rule for logic about another tool's commands, one owner of the backlog layout.
- done: each piece has one owner.

## 14. `scripts` files classify inconsistently (#147)

- why: `engrenage structure --check` reports `scripts/codegen/{apis,barrels,config,editions,rules}.ts` and `generate*.ts` as files outside any role; `scripts/codegen/constants.ts` classifies as a plain file, not the domain `constants.ts` role; `scripts/pnpm.ts` and `scripts/index.ts` sit loose at the environment root; the conventions do not say how a CLI command module relates to the generator function it runs (each generator is two modules, command and `generate…`).
- want: let `scripts` domains hold loose files, or define roles (`generators/`, `commands/`) and say how commands and functions pair.
- done: `structure --check` classifies every `scripts` file.

## 15. Generator wiring is hand-listed (#147)

- why: the `generated` globs list `Rules.ts` and `rules/**` by hand while `ConfigInput.ts` and `editions/constants.ts` are generated but not listed (the generators format them); `scripts/codegen/index.ts` runs generators in a hard-coded order (`editions, apis, config, rules, barrels`) derived from nothing.
- want: derive the globs and the order from the generators.
- done: adding a generator needs no second list.

## 16. Generated `ConfigInput` stays one file in `project/config/types` (#147)

- why: #147 step 3 asked for per-domain input types and a composed type in `workflows/registry/types/`; `project` cannot import `workflows` and `defineConfig` types its argument with `ConfigInput`. Sections do not map one to one onto domains (`aliases`, `roles` → `project/structure`; `cache`, `debug`, `define` → `project/config`; seven environments → `project/environments`); the file is 2,102 lines.
- want: per-domain `<Domain>Input` types composed without `project` importing `workflows`, and a `defineConfig` that does not need the tool input types.
- done: the generated input type is split by owning domain.

## 17. Trait vocabulary has no declared homes (#153)

- why: `resolveTraits` sits in `project/presets/utils/` (pure) though "owns composition and derivation" could mean `operations/`; `traitAdjustments` is exposed on `ProjectConfig` only so init can recompute traits, and no role covers state a step context must re-derive; `WorkflowSet.trait` and `Convention.traits` are tool-side declarations depending on a `project/presets` type, with no stated home for trait requirements of tool artefacts; `testsDistTsconfig` reads the raw input because a resolved option cannot tell a default from a given value (`declareObject` needs to allow a `false` default).
- want: state where trait requirements of tool artefacts live, and give declarations computed defaults.
- done: no section reads raw input to tell defaults from given values.

## 18. Context, format and mapping helpers lack homes (#153)

- why: `createContext` (flat config → `OptionContext`, public in `@auaust/engrenage/config`) sits in `project/config/utils/` though it is generic (`foundation/options/` or an `operations/` role fit); `project/format` gained a `config/schemas/` role; `mapConventions` is a pure mapping in `tools/prettier/utils/` (`config/` is a candidate); the ESLint creator and the conventions' public `rule(config)` and `delegates(config)` callbacks still take the flat `ProjectConfig`.
- want: place `createContext`, decide where tool mappings of conventions live, and move the ESLint creator and convention callbacks to `get`.
- done: no creator takes the flat config.

## 19. Format conventions do not reach JSON sync files (#153)

- why: `indent`, `indentWidth` and `endOfLine` of the `format` section are not applied to JSON that sync writes; `jsonIndentation` still derives from the constant `conventions`.
- want: JSON indentation derived from the resolved `format` section.
- done: changing `format.indent` changes the files sync writes.
