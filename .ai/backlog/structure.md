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
