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

## 5. Interfaces implemented elsewhere may be ports, not types

- why: `src/foundation/filesystem/types/Filesystem.ts`, `FileFormatter.ts` and `src/project/steps/types/Prompter.ts` state an interface that another domain implements (`createPrompter`); #154 made `Formatter` a port in `src/project/format/ports/`, which is what `ports/` and `adapters/` are for; they sit in `types/`. Other interfaces injected by `workflows` may be the same.
- want: review which `types/` modules are ports (interface injected, implemented by an adapter in another domain) and whether the decisions' "contract domains declare ports" applies beyond `project/build`; then relocate or state why not.
- done: every injected interface is a port or has a stated reason not to be.

## 6. Hook vocabulary and GitHub command logic have no home (#172)

- why: `HookEvent`, `HookDefinition` and `BudgetMode` sit in `tools/agents/types/` though hook-sync vocabulary is shared by `agents/claude` and `agents/codex` and the map has no home for code shared by both; `getEntryBudgetKind` hard-codes the `.ai/backlog` layout with `debtFile`, split from `createBacklogStep`.
- want: a home for code shared by the agent sub-domains, one owner of the backlog layout. #256 moves the GitHub-command parsing to `tools/github/utils`.
- done: each piece has one owner.

## 7. Generator wiring is hand-listed (#147)

- why: the `generated` globs list `Rules.ts` and `rules/**` by hand while `ConfigInput.ts` and `editions/constants.ts` are generated but not listed (the generators format them); `scripts/codegen/index.ts` runs generators in a hard-coded order (`editions, apis, config, rules, barrels`) derived from nothing.
- also: `engrenage.config.ts` generated-files list: may mean a missing pattern for generated files, or be unnecessary once generated files are formatted.
- want: derive the globs and the order from the generators.
- done: adding a generator needs no second list.

## 8. No way to detect unused code

- why: ESLint's `no-unused-vars` sees only file-local symbols; exported symbols never imported, and symbols reachable only through cycles, need a cross-file reference graph (ESLint alone cannot build it; the TypeScript language service or a tool like knip can).
- want: a `structure` subcommand or health-check command reporting, per symbol, one of: local and unused; exported and re-exported from an entrypoint only (matched through `export { x } from` or `export *`; not used as code); exported and never referenced. Used symbols are not reported; test usage does not count. Ideally also report symbols unreachable from every public entrypoint by traversing references from the entrypoints (cycles unreachable from a root included).
- done: the command runs, with a report in the spirit of the structure report.

## 9. `discovered` (role, `<env>.discovered`, `files.discovered`) loses its only lint consumer in #150

- why: #150 step 3 removes `noDefaultExport`, the sole reader, and enforces `exports`; `discovered` then only feeds the project map, duplicating `exports: "default"` (`setup.ts`, loaded by path, is the exception). `configuration.4` concerns the widening. `stylistic/naming`, `padded*` and `debtMarkers` derive from no structure.
- want: decide whether `discovered` goes from roles and config; state a reason for each non-structure rule.

## 10. Terms carry the wrong domain's meaning

- sites: `src/project/config/constants.ts:22` (test-variant suffixes belong to `project/environments`), `src/project/structure/operations/resolveImportRules.ts:72` (environment-sourced rules labelled `test-variant` instead of `environment`). `liveSections` and the `layout` option: #225.
- want: each term and constant owned by its domain, one meaning per name.

## 11. Packages built with engrenage publish no effect levels for their exports

- why: #234 ranks other packages' imports through the `structure.effects` config map only, though an engrenage-built package's roles already carry a level per export.
- want: such packages publish levels derived from their roles, read when another project imports them, so consumers stop declaring them by hand.
