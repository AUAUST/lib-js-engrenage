# Debt

Intake queue of the debt found by `@debt` markers in the code, organised by kind of debt. An entry is removed once a backlog entry or GitHub issue tracks it, or once its fix lands. Markers stay in the code until then.

## 1. Gate and stop-hook state leave unchecked paths

- `src/workflows/gate/operations/runGate.ts:185` (staged mode reads the worktree, not the index), `:208` (ESLint on changed files only; a type change breaking a dependent passes until CI), `:237` (a stamped tree never shows budget warnings again)
- `bin/engrenage/agents/claude/hook/stop.ts:35` (stop-marker logic in `bin`, per-agent markers never removed)
- why: each gap lets a commit pass what CI later rejects, or hides a warning.
- want: stop-marker logic in `workflows/gate`, with marker cleanup. Related: #228 (`bin/engrenage/eslint.ts:12` cache), #253.

## 2. Synchronous resolution and parsing calls

- `src/foundation/processes/operations/resolveBinary.ts:23`, `src/tools/changesets/setup/syncChangesetConfig.ts:19`, `src/tools/agents/operations/resolveAgentReference.ts:25`, `src/tools/prettier/operations/loadPrettier.ts:17`, `src/project/tsconfig/operations/createTsconfig.ts:74`
- why: Node has no promise-based module resolution; Prettier's `require` and the TypeScript config parser read synchronously, each `extends` level probing before the real parse.
- want: a decision per site: async alternative (`import()` for Prettier, one async tsconfig read) or accepted limit.

## 3. Versions are split by hand

- `scripts/pnpm.ts:6` (beside `compareVersions` and `parseMajorVersion`)
- want: one version parser yielding major, minor and patch. Related: #222.

## 4. Codex patch parser has no consumer

- `src/tools/agents/codex/utils/getPatchedFiles.ts:5`, test `tests/src/tools/agents/getPatchedFiles.test.src.ts`
- want: delete both.
- done: neither file exists.

## 5. Block parser mistakes `@debt` comments for directives

- `src/foundation/blocks/utils/syncBlocks.ts:35`
- why: temporary skip for the lazy-loading `@debt` comments of `fd4f415` (debug commit, still in history), which the marker regex reads as directives.
- want: the parser tells block markers from other comments; skip removed. Related: #221, #228.

## 6. Test infrastructure gaps

- `src/project/build/operations/createEmittedManifest.ts:25` (tsdown and Vite hooks untested; no real build with `clean: "emitted"`)
- `tests/scripts/codegen/generateApiDeclarations.test.src.ts:24` (bare timeout literal beside `binaryTimeout`)
- `tests/setup.ts:6` (every warning silenced, unexpected ones included)
- `tests/src/project/config/resolveListOption.test.src.ts:1` (tests `foundation/options` from `project/config`'s mirror directory)
- want: a build-level test; one named timeout scale; a logger engrenage owns so tests silence only expected warnings; the test moved to its domain's mirror.

## 7. Types asserted, probed or duplicated

- `scripts/codegen/operations/generateConfigTypes.ts:438` (draft 07 schema asserted to the draft 04 type)
- `src/project/tsconfig/utils/readTsconfigPaths.ts:19` (hand-written paths cast, not validated)
- `src/foundation/options/types/Section.ts:4` (resolver context `unknown`, narrowed by bivariant annotation)
- `src/tools/eslint/conventions/stylistic/noReturnUndefined.ts:67` (core ESTree nodes probed with `in`)
- `src/tools/eslint/conventions/stylistic/preferValuedReturn.ts:106` (cast and redundant `node.type` check)
- `src/project/structure/types/InlineRole.ts:1` (replaceable by the generated `InlineRoleInput`)
- want: validate at the boundary or type the listeners; delete `InlineRole`. Related: `coding-style.1`.

## 8. Structure vocabulary and placement

- `engrenage.config.ts:49` (`conventions` role holds ESLint rule conventions; collides with `project/format` `Conventions`)
- `src/tools/eslint/config/conventionCategories.ts:11` (no role fits the value; new role?)
- `src/project/structure/constants.ts:66` (only role key carrying its extension, one character from `setup`)
- `src/tools/agents/utils/renderProjectMap.ts:382` (matches the prose `source` label of `resolveAliases`; an alias should carry its node path as data)
- why: names and placements contradict the structure's own contracts.
- want: a decision on names and on a role for the category value (planning). Related: #227, `structure.2`.

## 9. Tool integration assumptions unchecked

- `src/tools/lefthook/constants.ts:3` (`lefthook.yml` at the project root, not the git root in a monorepo)
- `src/tools/pnpm/constants.ts:10` (`lefthook: false` listed to avoid `ERR_PNPM_IGNORED_BUILDS`; tests pin the entries)
- `src/tools/agents/codex/constants.ts:24` (no git bypass guard), `:25` (commits skip the gate until Codex's shell variable is known)
- `src/tools/agents/utils/measureGithubCommand.ts:23` (`--body-file` bodies not read)
- why: each holds only while the host tool behaves as observed.
- want: a check or a documented limit per site (planning).

## 10. Config code states intent indirectly

- `src/tools/git/operations/gitSection.ts:21` (composing adds nothing over the plain object)
- `src/project/config/operations/sourceSection.ts:12` (each environment splits into a declared and a derived section of one name; a cycle message can show it twice)
- want: write the object directly; give the derived section a distinct name. Related: #225.
