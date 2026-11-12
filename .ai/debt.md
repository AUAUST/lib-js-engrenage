# Debt

Intake queue of the debt found by `@debt` markers in the code, organised by kind of debt. An entry is removed once a backlog entry or GitHub issue tracks it, or once its fix lands. Markers stay in the code until then.

## 1. Lint rule loader in engrenage.config.ts is lazy only to skip ESLint tools

- sites: `engrenage.config.ts:52`
- why: the loader exists so a config load skips `tools/eslint`; the marker names #331 as the change that may remove the need.
- want: drop the loader once #331 injects the tools a run needs.

## 2. Generated-file list in engrenage.config.ts disables Prettier by hand

- sites: `engrenage.config.ts:214`
- why: the list stands in for a pattern describing generated files, or is unnecessary since generated files already come out formatted.
- done: needs a decision: a describing pattern, or no list.

## 3. Declaration context infers never where unknown is meant

- sites: `src/foundation/options/types/ObjectContext.ts:4`
- why: a declaration typed by the `DeclarationEntries` constraint infers `never`, read as no requirement.
- want: infer `unknown` at the declarer.

## 4. Config state resources locate themselves from stateDirectory

- sites: `src/project/config/extension.ts:30`
- why: `locate` cannot read `resources`, so each `state.<artefact>` recomputes its place from `stateDirectory`.
- want: the resolver locates a dotted resource inside its parent's directory.

## 5. LoadedConfig.forget reaches every holder, though only sync drops keys

- sites: `src/project/config/types/LoadedConfig.ts:5`
- why: `forget` touches holders that never keep resolved keys.
- want: needs planning: which holders keep keys and how they are told to drop them.

## 6. Structure node records accept undefined children

- sites: `src/project/environments/config/declarers/declareStructureNodes.ts:110`
- why: the root `structure` needs optionality, so child records also accept `undefined`, resolved as empty namespaces.
- want: optional only at the root.

## 7. .namespace.json lacks the children option the config accepts

- sites: `src/project/environments/config/schemas/namespaceMetadataSchema.ts:7`
- why: a namespace classifying its children as domains is declared only in the config.
- want: accept `children` in `.namespace.json`.

## 8. Structure types restate schema vocabulary and field names

- sites: `src/project/environments/types/NamespaceDeclaration.ts:6`, `src/project/structure/types/StructureNode.ts:22`, `src/project/structure/types/StructureOptions.ts:20`
- why: relation and `children` picklists repeat `declareStructureNodes` and `StructureRelation`; `StructureNode.childKind` differs in name from the `children` option; `StructureOptions` repeats `DeclaredStructure`.
- want: derive the types from the schemas; extend `DeclaredStructure` with `source`.

## 9. Role contract definitions stay unfrozen

- sites: `src/project/structure/config/sections/structureSection.ts:121`
- why: freezing in place would freeze caller-owned preset values.
- want: freeze copies, once toolkit's `constant()` (toolkit backlog) exists.

## 10. Role contracts cannot see their directory

- sites: `src/project/structure/utils/completeRole.ts:69`
- why: a root role never placed at an environment root passes this check.
- done: needs planning: the contract needs directory context.

## 11. Resolution errors name the domain path, not the declaring file

- sites: `src/project/structure/operations/resolveEnvironmentStructure.ts:164`
- why: resolved domain options drop their source file, so `collects` errors do not point at `.domain.json` or config.
- want: keep the source on resolved options and name it in the error.

## 12. Structure file groups are recomputed from assignments

- sites: `src/project/structure/utils/groupRoleFiles.ts:5`
- why: `getStructureCardinality` groups the same assignments again.
- want: take the groups from the assignments.

## 13. Lint rule copies upstream usage counting to look through NoInfer

- sites: `src/tools/eslint/conventions/stylistic/noUnnecessaryTypeParameters.ts:51`
- why: the upstream rule does not unwrap `NoInfer`, so this walk duplicates its usage count.
- done: needs an upstream fix or a decision to keep the copy.

## 14. Option-bearing rule kept out of typescriptRules

- sites: `src/tools/eslint/operations/createRecommendedRules.ts:44`
- why: `Rule` types options as mutable tuples, which the constants role rejects.
- want: the constants role accepts readonly tuples, or the rule options are typed readonly.

## 15. Paths with glob syntax are matched as patterns

- sites: `src/tools/git/operations/listIgnoredGlobs.ts:46`, `src/tools/typescript/extension.ts:47`
- why: each path becomes a glob unescaped, and barrel paths such as `[id]` match other files or none.
- want: escape literal paths before globbing.

## 16. GitHub snapshot errors and ordering lose information

- sites: `src/tools/github/issues/api/operations/fetchGithubSnapshot.ts:240`, `:323`
- why: a fine-grained token lacking a permission surfaces without naming it; sorting drops GitHub's option priority and pinned order.
- want: name the missing permission; keep GitHub's order.

## 17. Manifest and remote reads treat any failure as missing

- sites: `src/tools/github/issues/api/operations/readManifestRepository.ts:26`, `src/tools/github/issues/api/operations/resolveCurrentRepository.ts:12`
- why: any read failure reads as a missing manifest; any git failure reads as a missing `origin` remote.
- want: tell a missing file or remote from a failed read.

## 18. Repository is carried as an unparsed string

- sites: `src/tools/github/issues/api/types/GithubAccess.ts:3`, `src/tools/github/issues/contract/types/ParsedIssueBody.ts:3`
- why: every route splits `<owner>/<repo>` again; a plain `#<n>` entry carries `repository: undefined`.
- want: carry owner and name parsed; parse entries against a base repository.

## 19. Planning vocabulary restated by hand in schemas

- sites: `src/tools/agents/config/schemas/skillSchema.ts:21`, `src/tools/github/config/schemas/issueProtocolSchema.ts:33`
- why: the complexity keys and the meaning keys of each group repeat the GitHub contract's meanings.
- want: derive the entries from the meaning constants.

## 20. Generated data-file schema has no role

- sites: `src/tools/github/issues/api/config/schemas/githubSnapshotSchema.ts:19`
- why: a schema of a generated data file, not of an option declaration; no role fits it.
- done: needs planning: a role for data-file schemas.

## 21. GitHub index re-exports subdomains by hand

- sites: `src/tools/github/index.ts:1`
- why: the index lists its subdomains' exports by hand.
- done: needs planning: generated re-exports for subdomains.

## 22. Roadmap links miss repeated-heading anchors

- sites: `src/tools/github/issues/drafts/utils/renderRoadmap.ts:3`
- why: GitHub suffixes a repeated heading's anchor with `-<k>`, which links miss.
- want: link the suffixed anchor.

## 23. gh body from a file is not measured

- sites: `src/tools/agents/utils/measureGithubCommand.ts:22`
- why: a body passed with `--body-file` is not read, so the whole command text stands in for it.
- want: read the body file.

## 24. Lefthook key still named "local"

- sites: `src/tools/lefthook/constants.ts:10`
- why: the command runs every `everyone` gate step; the key name is stale.
- done: needs planning: renaming makes sync remove the old key from existing `lefthook.yml` files.

## 25. groupedOverloads joins signatures of different functions

- sites: `src/tools/prettier/conventions/layout/groupedOverloads.ts:20`
- why: it groups consecutive signatures of differently named functions, as ESLint's `function-overload` matcher did.
- want: group only overloads of one function.

## 26. Prettier plugins named by string bypass the layout plugin

- sites: `src/tools/prettier/operations/createPrettierConfig.ts:44`
- why: plugins named by a string or URL are loaded by Prettier, so the layout plugin cannot wrap their parsers or printers.
- done: needs planning: wrap named plugins or change the plugin contract.

## 27. Prettier formats only changed files and every changed file

- sites: `src/tools/prettier/operations/fixWithPrettier.ts:6`, `:7`
- why: a Prettier config or plugin change leaves unchanged files for CI to reject; changed files outside the declared environments are formatted too.
- done: needs planning: formatting scope.

## 28. Layout plugin copies Prettier's internal shapes

- sites: `src/tools/prettier/utils/isParenthesized.ts:6`, `src/tools/prettier/utils/keepsOwnBreak.ts:45`, `src/tools/prettier/utils/printAssignment.ts:41`, `:105`, `:154`, `:180`, `src/tools/prettier/utils/printConditional.ts:52`, `:80`, `src/tools/prettier/utils/printLines.ts:5`
- why: parentheses, assignment layout, conditional indent and JSX mode are read from Prettier's private printers' shapes; sub-docs are printed to text to measure widths.
- done: needs planning: keep the copies, use an own printer, or drop the layout plugin.

## 29. Layout plugin approximates comment attachment and range offsets

- sites: `src/tools/prettier/plugins/createLayoutPlugin.ts:49`, `:190`
- why: the ignored node is an approximation of Prettier's comment attachment; the whole text is reformatted before `rangeStart`, `rangeEnd` and `cursorOffset` are read, so they point into the unformatted text.
- want: map offsets through the reformat and use Prettier's attachment.

## 30. Layout parser fails on Flow files

- sites: `src/tools/prettier/plugins/createLayoutPlugin.ts:204`
- why: the `typescript` parser cannot read Flow syntax the `babel` parser accepts, so such files fail to format.
- want: choose the parser by the file's syntax.

## 31. Prettier visitor walks metadata keys

- sites: `src/tools/prettier/utils/visitNodes.ts:20`
- why: it walks every enumerable key except known metadata instead of the parser's visitor keys.
- want: walk the parser's visitor keys.

## 32. Tooling definer entries memoized per process

- sites: `tooling/eslint/rules/definerEntries.ts:59`
- why: a long-lived ESLint, such as an editor server, keeps an entry's first reading after the config changes.
- want: memoize per lint run.

## 33. Mirror directories reach Vitest as substring filters

- sites: `src/tools/vitest/operations/runGateTests.ts:71`
- why: a trailing `/` keeps sibling directories from matching; `owned` mixes these filters with test files as plain strings.
- want: match exact directories.

## 34. Stamped tree drops budget warnings

- sites: `src/workflows/gate/operations/runGate.ts:322`
- why: a stamped tree reports no budget warnings, so the commit after a passing stop never shows them again.
- done: needs planning: whether a stamp replays its warnings.

## 35. Sync and config code warns through console instead of returning results

- sites: `src/workflows/sync/operations/runSyncCheck.ts:12`, `src/workflows/sync/setup/syncPackageJson.ts:155`, `src/project/config/operations/readRawConfig.ts:24`, `src/tools/typescript/operations/produceTsconfigTypes.ts:60`, `src/tools/agents/setup/syncAgentFiles.ts:110`, `src/project/baseline/operations/resolveSourceRuntime.ts:23`
- why: warnings print beside the gate's output instead of being returned in the result.
- want: return warnings in the result; the gate prints them.

## 36. Barrel blocks and flat entries hide name collisions

- sites: `src/tools/typescript/setup/syncBarrelBlocks.ts:8`, `src/tools/typescript/setup/syncBarrelFiles.ts:11`
- why: a block cannot read the names a hand-written flat entry spreads, so collisions surface only in TypeScript.
- done: needs planning: read names from the flat entry or forbid collisions.

## 37. Role of each domain file re-derived from names

- sites: `src/tools/typescript/operations/listDomainModules.ts:20`
- why: the structure walker already classifies each file; this re-derives roles from `fileNames`.
- want: the resolved structure carries each role node's files with their roles.

## 38. Test project builders repeated across lint tests

- sites: `tests/src/tools/eslint/boundaries.test.ts:141`, `tests/src/tools/eslint/noComplexConciseArrows.test.ts:11`
- why: the boundary and concise-arrow tests clone the temporary project and ESLint setup of other tests.
- want: one shared builder in test utilities.

## 39. Agent fragments listed beside the template

- sites: `src/tools/agents/operations/getInstructionTemplates.ts:36`
- why: fragments are listed beside the AGENTS.md template instead of through `listDataFiles`, which needs a package root URL.
- done: needs planning: how engrenage's own fragments get a package root.

## 40. Agent rule fillers recomputed in plan

- sites: `src/tools/agents/setup/createAgentRulesStep.ts:21`
- why: the fillers are recomputed on each `plan()`.
- want: cache them.

## 41. Readonly list in a schema is not readonly in its JSON Schema

- sites: `src/project/roles/config/schemas/reexportSchema.ts:5`
- why: the list lacks `readonly()` because the JSON Schema codegen cannot convert it, so the output is mutable and the types restate it as readonly.
- done: needs the codegen to convert readonly lists, or a planned workaround.

## 42. Local guard restates toolkit's isArray for readonly lists

- sites: `src/project/config/operations/createProjectConfig.ts:42`
- why: toolkit's `isArray` narrows to `any[]`, which a readonly list is not assignable to.
- want: toolkit's `isArray` narrows readonly lists; then delete the local guard (toolkit side).
