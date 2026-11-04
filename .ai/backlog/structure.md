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
