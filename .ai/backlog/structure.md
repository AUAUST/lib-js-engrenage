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
  - `sync…` is for sync targets only, yet `syncBlocks`, `syncFiles`, `syncIgnoreFile`, `syncFrontmatter`, `syncEditHook` and `syncCodexInstructions` are not targets.
  - `TsconfigEnvironment` (exported by `project/config`) still permutes `EnvironmentTsconfig`; renaming it is breaking.
- want: a decision per group: amend the naming rule or rename.
- done: names and rules agree.

## 3. The `conventions` role in `engrenage.config.ts` is unscoped and misnamed

- sites: `engrenage.config.ts:123`, `:129`
- why: namespace `roles.enable` only accepts catalogue roles; it imports section values only the creator resolves; `conventions` names ESLint rule conventions and collides with `project/format`'s `Conventions`.
- want: scope the role to its namespace (or state why not); a decision on the name (planning).

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
- also: `engrenage.config.ts:214` generated-files list: a missing pattern for generated files, or unneeded once they are formatted.
- want: derive the globs and the order from the generators.
- done: adding a generator needs no second list.

## 8. No way to detect unused code

- why: ESLint's `no-unused-vars` sees only file-local symbols; exported symbols never imported, and symbols reachable only through cycles, need a cross-file reference graph (ESLint alone cannot build it; the TypeScript language service or a tool like knip can).
- want: a `structure` subcommand or health-check command reporting, per symbol, one of: local and unused; exported and re-exported from an entrypoint only (matched through `export { x } from` or `export *`; not used as code); exported and never referenced. Used symbols are not reported; test usage does not count. Ideally also report symbols unreachable from every public entrypoint by traversing references from the entrypoints (cycles unreachable from a root included).
- done: the command runs, with a report in the spirit of the structure report.

## 9. `discovered` (role, `<env>.discovered`, `files.discovered`) loses its only lint consumer in #150

- why: #150 step 3 removes `noDefaultExport`, the sole reader, and enforces `exports`; `discovered` then only feeds the project map, duplicating `exports: "default"` (`setup.ts`, loaded by path, is the exception). `configuration.4` concerns the widening. `stylistic/naming`, `padded*` and `debtMarkers` derive from no structure.
- want: decide whether `discovered` goes from roles and config; state a reason for each non-structure rule.

## 10. Packages built with engrenage publish no effect levels for their exports

- why: #234 ranks other packages' imports through the `structure.effects` config map only, though an engrenage-built package's roles already carry a level per export.
- want: such packages publish levels derived from their roles, read when another project imports them, so consumers stop declaring them by hand.

## 11. Global modules own domain vocabulary

- sites: `src/constants.ts:5`, `src/entry.ts:1`
- why: global constants carry tool knowledge (package names, config file names); the global types role holds block types, sync results, `IgnorePresets` and `GlobGroup`.
- want: each value and type moved to its owning domain.

## 12. Role and domain names are hardcoded or collide

- sites: `src/project/roles/constants.ts:9`, `src/tools/eslint/conventions/structure/readonlyConstants.ts:20`, `src/tools/eslint/constants.ts:232`, `src/foundation/data/index.ts:1`
- why: index and entry roles found by fixed names though a preset's `name` renames them; the constants role found by preset name; the index key repeats `project/roles`, which a utility cannot import at runtime; `data` names a one-function domain like the environment.
- want: roles resolved from declared names; a domain name not colliding with an environment.

## 13. Structure declaration in `engrenage.config.ts` mixes concerns

- sites: `engrenage.config.ts:108`, `:135`
- why: the `config` role holds the identity definer `defineConfig` beside I/O, while lint ranks roles by imports only; scripts and tooling list roles none of their modules use. Hand-listed constants subpaths: #495.
- want: a decision on the role split (planning).

## 14. Role presets sit among utils and rank wrongly

- sites: `src/project/roles/utils/*.ts` (one preset per file, 25 markers), `engrenage.config.ts:91`, `src/project/docs/utils/*.ts` (tag presets, AUAUST/lib-js-engrenage#439: their default list sits in `utils/listConventionalTags.ts` since pure `constants` cannot import them)
- why: each file is a role preset, not a utility; `adapters` is the only preset without an effect level, so projects override it; `schemas` is pure though `foundation/options` declarer schemas import confined utils; `testutils` should be observing once its type exists.
- want: presets in their own role directory; `adapters` ranked by the preset (planning for the rest).

## 15. Structure resolvers and index hold loose rules

- sites: `src/project/structure/operations/createStructureDomainResolver.ts:68`, `createStructureRoleResolver.ts:131`, `src/project/structure/utils/createEntityIndex.ts:96`, `:101`, `src/project/structure/operations/findImportCycles.ts:238`
- why: a later `undefined` overrides an earlier glob's value; a directory role passes as a file role; public file roles stay out of the surface; child visibility misses a namespace's scoped roles; without `verbatimModuleSyntax`, a value re-export of a type-only module counts as a runtime edge.
- want: each rule fixed at its site.

## 16. Structure boundary and layer rules miss cases

- sites: `src/project/structure/utils/checkBoundary.ts:47`, `:111`, `checkLayers.ts:7`, `checkSurfaces.ts:8`
- why: the fix reads the index specifier as the first surface entry; files at an environment root outside global roles and root entry, and imports between two directories of one environment, are never checked; layer and surface rules split by target kind.
- want: index specifier read directly; every environment file checked; rules split by broken relation.

## 17. Structure reads tsconfig to find output directories

- sites: `src/project/structure/config/sections/aliasesSection.ts:22`, `:26`, `entitiesSection.ts:16`
- why: an unreadable tsconfig hides the output directory, so the alias is generated and the index skips instead of failing; aliases target the language named `typescript` only.
- want: output directory resolved without the tsconfig; aliases not keyed by one language name.

## 18. Structure and map renderers are ad hoc

- sites: `src/project/structure/utils/renderStructure.ts:55`, `:83`, `src/tools/agents/utils/renderEnvironmentMap.ts:15`
- why: path segments recomposed by hand though the node provides them; map renderers repeat code.
- want: segments from the node; one structured renderer shared by the map renderers.

## 19. Namespaces declared under a domain glob are ignored

- sites: `src/project/structure/utils/flattenStructure.ts:75`, `src/project/structure/operations/createStructureDomainResolver.ts:38`
- why: `flattenStructure` keys a namespace under a glob domain by its glob path (`a/*/ns`); `describe` looks namespaces up by exact path, so none matches.
- want: namespaces under globs matched like domains, or rejected by the schema.

## 20. A domain's index drops a role's modules silently when it has no `@barrel <role>` marker

- why: `syncBarrelBlocks` (`src/tools/typescript/setup/syncBarrelBlocks.ts`) fills only existing markers, so modules moved into a role the index has no block for leave its surface while `sync --check` passes; seen moving interfaces to `apis/` and `ports/` in AUAUST/lib-js-engrenage#533. Related: #9 ("Markers fail silently").
- want: sync adds the missing block, or `--check` reports each placed role whose modules no marker of the index covers.
