# structure

Project structure description, its report and the tooling generated from it.

## 1. Naming rules of the roles are broken by many modules.

- why: #141 findings.
  - `produceTsconfig*` (12 modules) and `tsconfigProducers` sit in `operations/`; `produce` is not among the verbs of the decisions and no role fits better.
  - `defineConvention` and other convention `define*` builders (`tools/eslint/utils/`) break "`define…Config` for definers only".
  - `sync…` is for sync targets only, yet `syncBlocks`, `syncFiles`, `syncIgnoreFile`, `syncFrontmatter`, `syncEditHook` and `syncCodexInstructions` are not targets.
  - `TsconfigEnvironment` (exported by `project/config`) still permutes `EnvironmentTsconfig`; renaming it is breaking.
- want: a decision per group: amend the naming rule or rename.
- done: names and rules agree.

## 2. The `conventions` role in `engrenage.config.ts` is unscoped and misnamed

- sites: `engrenage.config.ts:123`, `engrenage.config.ts:129`
- why: namespace `roles.enable` only accepts catalogue roles; it imports section values only the creator resolves; `conventions` names ESLint rule conventions and collides with `project/format`'s `Conventions`.
- want: scope the role to its namespace (or state why not); a decision on the name (planning).

## 3. Roles for step adapters and non-tool sync targets are undefined (#143)

- why: `createPrompter` (adapter of the `Prompter` port) stays in `workflows/cli/operations`, `workflows/sync` has no `adapters/` role to take it; `syncPackageJson`, a sync target of no tool, went to `workflows/sync/setup/`; the plan names only "init and sync step contracts" for `project/steps`, yet `Prompter` and `Invocation` live there.
- want: decide whether `workflows` domains get `adapters/` and whether `setup/` may hold targets of no tool; state `project/steps` content.
- done: the roles and the plan agree.

## 4. Interfaces implemented elsewhere may be ports, not types

- why: `src/foundation/filesystem/types/Filesystem.ts`, `FileFormatter.ts` and `src/project/steps/types/Prompter.ts` state an interface that another domain implements (`createPrompter`); #154 made `Formatter` a port in `src/project/format/ports/`, which is what `ports/` and `adapters/` are for; they sit in `types/`. Other interfaces injected by `workflows` may be the same.
- want: review which `types/` modules are ports (interface injected, implemented by an adapter in another domain) and whether the decisions' "contract domains declare ports" applies beyond `project/build`; then relocate or state why not.
- done: every injected interface is a port or has a stated reason not to be.

## 5. Hook vocabulary and GitHub command logic have no home (#172)

- why: `HookEvent`, `HookDefinition` and `BudgetMode` sit in `tools/agents/types/` though hook-sync vocabulary is shared by `agents/claude` and `agents/codex` and the map has no home for code shared by both; `getEntryBudgetKind` hard-codes the `.ai/backlog` layout with `debtFile`, split from `createBacklogStep`.
- want: a home for code shared by the agent sub-domains, one owner of the backlog layout. #256 moves the GitHub-command parsing to `tools/github/utils`.
- done: each piece has one owner.

## 6. Generator wiring is hand-listed (#147)

- why: the `generated` globs list `Rules.ts` and `rules/**` by hand while `ConfigInput.ts` and `editions/constants.ts` are generated but not listed (the generators format them); `scripts/codegen/index.ts` runs generators in a hard-coded order (`editions, apis, config, rules, barrels`) derived from nothing.
- also: `engrenage.config.ts:214` generated-files list (debt.2): it feeds `.prettierignore`, jscpd's exclusions and ESLint's `files.generated` scope, so formatting generated output does not make it unneeded.
- want: derive the globs and the order from the generators.
- done: adding a generator needs no second list.

## 7. No way to detect unused code

- why: `no-unused-vars` sees file-local symbols only; exports never imported and symbols reachable only through cycles need a cross-file reference graph (TypeScript language service, or knip).
- want: a `structure` subcommand reporting each symbol that is local and unused, exported and only re-exported from an entrypoint, or exported and never referenced; test usage does not count. Ideally also symbols unreachable from every public entrypoint, cycles included.
- done: the command runs, reporting like the structure report.

## 8. `discovered` (role, `<env>.discovered`, `files.discovered`) loses its only lint consumer in #150

- why: #150 step 3 removes `noDefaultExport`, the sole reader, and enforces `exports`; `discovered` then only feeds the project map, duplicating `exports: "default"` (`setup.ts`, loaded by path, is the exception). `configuration.4` concerns the widening. `stylistic/naming`, `padded*` and `debtMarkers` derive from no structure.
- want: decide whether `discovered` goes from roles and config; state a reason for each non-structure rule.

## 9. Packages built with engrenage publish no effect levels for their exports

- why: #234 ranks other packages' imports through the `structure.effects` config map only, though an engrenage-built package's roles already carry a level per export.
- want: such packages publish levels derived from their roles, read when another project imports them, so consumers stop declaring them by hand.

## 10. Global modules own domain vocabulary

- sites: `src/constants.ts:5`, `src/constants.ts:84`, `src/entry.ts:1`
- why: global constants carry tool knowledge (package names, config file names, the agents' hook program); the global types role holds block types, sync results, `IgnorePresets` and `GlobGroup`.
- want: each value and type moved to its owning domain.

## 11. Role and domain names are hardcoded or collide

- sites: `src/batiment/roles/constants.ts:3`, `src/tools/eslint/conventions/structure/readonlyConstants.ts:19`, `src/tools/eslint/conventions/docs/documented.ts:21`, `src/tools/eslint/constants.ts:232`, `src/foundation/data/index.ts:1`
- why: index and entry roles found by fixed names though a preset's `name` renames them; the constants and contract roles found by preset name; the index key repeats `batiment/roles`, which a utility cannot import at runtime; `data` names a one-function domain like the environment.
- want: roles resolved from declared names; a domain name not colliding with an environment.

## 12. Structure declaration in `engrenage.config.ts` mixes concerns

- sites: `engrenage.config.ts:108`, `engrenage.config.ts:135`
- why: the `config` role holds the identity definer `defineConfig` beside I/O, while lint ranks roles by imports only; scripts and tooling list roles none of their modules use.
- want: a decision on the role split (planning).

## 13. Structure resolvers and index hold loose rules

- sites: `src/batiment/structure/operations/createStructureDomainResolver.ts:68`, `src/batiment/structure/operations/createStructureRoleResolver.ts:131`, `src/batiment/structure/utils/createEntityIndex.ts:96`, `src/batiment/structure/utils/createEntityIndex.ts:101`, `src/project/structure/operations/findImportCycles.ts:238`
- why: a later `undefined` overrides an earlier glob's value; a directory role passes as a file role; public file roles stay out of the surface; child visibility misses a namespace's scoped roles; without `verbatimModuleSyntax`, a value re-export of a type-only module counts as a runtime edge.
- want: each rule fixed at its site.

## 14. Structure boundary and layer rules miss cases

- sites: `src/batiment/structure/utils/checkBoundary.ts:47`, `src/batiment/structure/utils/checkBoundary.ts:111`, `src/batiment/structure/utils/checkBoundary.ts:201`, `src/batiment/structure/utils/checkLayers.ts:7`, `src/batiment/structure/utils/checkSurfaces.ts:8`
- why: the fix reads the index specifier as the first surface entry; files at an environment root outside global roles and root entry, and imports between two directories of one environment, are never checked; layer and surface rules split by target kind; the lineage condition never decides.
- want: index specifier read directly; every environment file checked; rules split by broken relation.

## 15. Structure reads tsconfig to find output directories

- sites: `src/project/structure/config/sections/aliasesSection.ts:22`, `src/project/structure/config/sections/aliasesSection.ts:26`, `src/project/structure/config/sections/entitiesSection.ts:16`, `src/project/structure/utils/createImportResolver.ts:16`, `src/tools/typescript/operations/readTypescriptExtensions.ts:5`, `src/tools/typescript/setup/syncAliases.ts:182`
- why: an unreadable tsconfig hides the output directory, so the alias is generated and the index skips instead of failing; aliases target the language named `typescript` only, its lookup repeated in `readTypescriptLanguage`; a `#…` import of a `.tsx` module resolves to the alias's `.ts` target; `syncAliases` strips the first extension to recover a stem.
- want: output directory resolved without the tsconfig; one language lookup on the environments surface; an `Alias` carrying its stem and every extension.

## 16. Map and tree renderers are ad hoc

- sites: `src/batiment/structure/utils/renderEnvironmentMap.ts:10`, `src/batiment/structure/utils/renderStructureTree.ts:15`
- why: map renderers repeat code; one `detailed` flag branches every tree helper.
- want: one structured renderer shared by the map renderers; two row policies over one drawing.

## 17. Namespaces declared under a domain glob are ignored

- sites: `src/batiment/structure/utils/flattenStructure.ts:75`, `src/batiment/structure/operations/createStructureDomainResolver.ts:38`
- why: `flattenStructure` keys a namespace under a glob domain by its glob path (`a/*/ns`); `describe` looks namespaces up by exact path, so none matches.
- want: namespaces under globs matched like domains, or rejected by the schema.

## 18. A domain's index drops a role's modules silently when it has no `@barrel <role>` marker

- why: `fillBarrelBlock` (`src/tools/typescript/operations/fillBarrelBlock.ts`) fills only existing markers, so modules moved into a role the index has no block for leave its surface while `sync --check` passes; seen moving interfaces to `apis/` and `ports/` in AUAUST/lib-js-engrenage#533. Related: #8 ("Markers fail silently").
- want: sync adds the missing block, or `--check` reports each placed role whose modules no marker of the index covers.

## 19. Duplicate-role errors name merged positions, not the config's

- why: since default roles (AUAUST/lib-js-engrenage#629), `listEnvironmentRoles` puts defaults before listed roles, so `registerRoles` names `src.roles[9]` for the config's `src.roles[0]`; marked `@debt` in `src/batiment/roles/utils/registerRoles.ts`.
- want: `resolveRoles` receives each role's own config position (or none for a default) and errors name it.

## 20. Structure types restate schema vocabulary and field names

- sites: `src/batiment/environments/types/NamespaceDeclaration.ts:6`, `src/batiment/environments/types/DomainDeclaration.ts:4`, `src/batiment/structure/types/StructureNode.ts:28`, `src/batiment/structure/types/StructureOptions.ts:20`, `src/batiment/structure/types/DeclaredStructure.ts:14`
- why: relation and `children` picklists repeat `declareStructureNodes` and `StructureRelation`; `childKind` differs in name from the `children` option; `DomainDeclaration`, `DeclaredStructure` and `StructureOptions` repeat the domain fields (jscpd).
- want: types derived from the schemas; `StructureOptions` extends `DeclaredStructure` with `source`.

## 21. Structure node records accept undefined children

- sites: `src/batiment/environments/config/declarers/declareStructureNodes.ts:135`
- why: the root `structure` needs optionality, so child records also accept `undefined`, resolved as empty namespaces.
- want: optional only at the root.

## 22. Role contracts stay unfrozen and cannot see their directory

- sites: `src/project/structure/config/sections/structureSection.ts:195`, `src/batiment/roles/utils/completeRole.ts:96`
- why: freezing in place would freeze caller-owned preset values; a root role never placed at an environment root passes the contract check.
- want: frozen copies once toolkit's `constant()` exists (`toolkit.11`); directory context for contracts (planning).

## 23. Role file assignments are re-derived by their consumers

- sites: `src/batiment/structure/utils/groupRoleFiles.ts:5`, `src/batiment/structure/operations/createStructureDomainResolver.ts:122`, `src/tools/typescript/operations/listDomainModules.ts:20`
- why: `getStructureCardinality` regroups the assignments; `assignRoleFiles` recomputes the static globs; `listDomainModules` re-derives roles from `fileNames` though the walker classifies each file.
- want: the resolved structure carries each role node's files, groups and globs.

## 24. Schemas of data files have no role

- sites: `src/tools/github/issues/api/config/schemas/githubSnapshotSchema.ts:19`, `src/project/sync/config/schemas/syncRecordSchema.ts:3`, `src/tools/pnpm/config/schemas/linkSchema.ts:3`, `src/tools/pnpm/config/schemas/linksSchema.ts:5`
- why: they validate generated or local state files, not option declarations, so `schemas/` under `config/` misplaces them.
- done: needs planning: a role for data-file schemas.

## 25. Subdomain re-exports are hand-written

- sites: `src/tools/github/index.ts:1`
- why: the index lists its subdomains' exports by hand.
- done: needs planning: generated re-exports for subdomains.

## 26. Barrel blocks hide flat-entry collisions and reload their renderer

- sites: `src/tools/typescript/operations/fillBarrelBlock.ts:5`, `src/tools/typescript/operations/fillBarrelBlock.ts:6`, `src/tools/typescript/setup/syncBarrelFiles.ts:11`
- why: a block cannot read the names a hand-written flat entry spreads, so collisions surface only in TypeScript; each block builds its own renderer, reloading the `barrels.exports` resolvers.
- want: one renderer per run; collisions read from the flat entry or forbidden (planning).

## 27. Role presets and structure sources leave contracts unstated

- sites: `src/project/roles/presets/schemas.ts:3`, `src/project/roles/presets/testutils.ts:12`, `src/batiment/structure/types/StructureSource.ts:1`
- why: `schemas` is pure by default though declarer-built schemas import confined utils; `testutils` waits for an observing level; no code produces the `preset` source.
- want: role levels matching what modules import; the `preset` source produced or removed.

## 28. Layer and surface checks skip package self-references

- sites: `src/batiment/structure/utils/checkLayers.ts:14`, `src/batiment/structure/utils/getImportCategory.ts:11`
- why: only `relative` and `alias` imports are checked; `@auaust/engrenage/...` counts as `public-entries`, granted to `src`, so a lower layer importing a workflows entry passes lint.
- want: self-references resolved to their source domain and checked like aliases.

## 29. No issue owns walking workspace environments' structure

- sites: `src/project/structure/config/sections/structureSection.ts:31`
- why: the section resolves root environments only, yet #741 (`structure[id]`), #758, #760 and #761 assume a per-scope walk (#732 › Resolution).
- want: one issue owns the per-scope walk, as a first leaf of #757 or an item under #732.

## 30. The workspaces schema describes each glob as one environment

- sites: `src/project/workspaces/config/schemas/workspacesSchema.ts:13`
- why: since #793 environments come from `.environment.json`, so the description is stale.

## 31. Workspace `imports` declared in two places

- why: #675 › Decisions puts a workspace's `imports` in `.workspace.json` (#729, read by #714); #739 and #802 put per-environment opt-ins in `.environment.json`.
- want: one owner; recommended: #802's opt-ins, #729 deriving from them, #675 and #714 updated.

## 32. Workspace tests cannot reach root test helpers past sealed `tests`

- why: #675 › Decisions lets nested tests import root `tests` helpers; #800 and #743 › Decisions seal `tests` inward.
- want: decide among an opt-in per workspace tests environment, `inward: "surface"` for `tests` (`tests/utils`, `tests/fixtures`, as #728 recommends), or a separate helpers kind.
