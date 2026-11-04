# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: it says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. `AGENTS.md` describes the pre-#141 module layout.

- why: the project map says `config/` holds definers and `utils/` "every other function" and omits `operations/`; it says logic lives in `config/` and `utils/`; it names `tests/helpers/` (now `tests/utils/`).
- done: #152 rewrites the instructions and `pnpm engrenage sync agents` has propagated them.

## Stale after #180

- why: AGENTS.md says to run `pnpm build:tsdown`, a script `package.json` lacks (`pnpm build` runs `engrenage tsdown`); its project map still describes the pre-namespace `src/` layout (rewrite: #152).
- done: the build command and project map match the repository.

## Stale after #143

- why: `.ai/debt.md` cites `src/workflows/cli/operations/resolveBinary.ts` (now `src/foundation/processes/operations/resolveBinary.ts`) and `createStepContext.ts` line numbers (7, 12, 20, 23, 117); AGENTS.md and the project map omit `project/steps`; plan §Config pipeline describes `StepContext` with `get`, true only after the operations question is settled.
- done: paths, maps and plan match the code.

## Stale after #143 round 2

- why: plan §Config pipeline says `StepContext<Sections>` replaces `config`, true except for the VS Code steps (via `loadInfoRules` → `createEslintConfig`); `@auaust/engrenage/config` no longer exports `ResolvedAgents`.
- done: the plan and exports description match.

## Stale after #143 round 3

- why: plan §Config pipeline shows `project/config` taking raw input once per root, while `readConfig` validates the whole config eagerly until steps 4 and 5 land.
- done: the plan and code agree.

## Stale after #143 round 4

- why: `.ai/debt.md` and plan §Config pipeline still describe `ResolvedConfig` and `createResolvedConfig`; AGENTS.md project map omits `project/steps` and `workflows/registry`; docs describing `loadConfig` as returning every section (the public one is partial now); `scripts/support/codegen/config.ts` description says "Config interface" (now `ConfigInput`).
- done: each matches the code.

## Stale after #143 round 5

- why: plan §Config pipeline says the registry composes each environment's schema; it is composed in `project/environments`.
- done: the plan matches.

## Length budget hooks follow-ups (#172)

- why: `gh issue edit` without `--title` cannot be classified and takes the plan budget; `--body "…"` and `--body-file <path>` are not parsed (whole command length stands in); words are a whitespace split of raw markdown, so tables and links inflate counts; the four hook commands repeat payload parsing and `loadConfig`; the Claude `if: "Bash(gh issue *)"` entry was written from memory and unverified, and the Codex entry runs on every Bash call; Codex needs a trust step (`/hooks`) for the new entry, undocumented; `deny` on an edit hook cannot undo the write.
- want: classify edits through `gh`, parse both body flags, a shared hook-payload operation, verify `if`, document the Codex trust step.
- done: oversized writes are measured however the body is passed.

## Stale after #172

- why: `agentsSchema` descriptions of `claudeSettings` and `codexHooks` say "the edit hook"; the step prompts in `createClaudeSettingsStep.ts` and `createCodexHooksStep.ts` omit the budget and github hooks; #137 and #165 still describe `syncEditHook` and a `PostToolUse` entry only.
- done: descriptions, prompts and issues match.

## Stale after #147

- why: AGENTS.md "Project and tools" and "Modules and exports" still describe `src/support/` and codegen in `src/`, and its Commands line should name `scripts/codegen/`; #147's table still lists `sync…` names and `scripts/support/codegen/…` paths.
- done: the map and issue match `scripts/codegen/` and the `generate…` names.

## Stale after #153 (partial)

- why: backlog `configuration.md` entry 3 says host presets resolve to the traits "owned directories, published" (the former is open); plan #137 §Decisions "until #153 adds it, read the `library` preset with a `@debt` marker" is obsolete; `changesets.md` may still mention presets.
- done: each matches the traits model.

## Stale after #153 (Prettier)

- why: `README.md` was not scanned for the removed `"prettier": "@auaust/engrenage/prettier"` reference; the default export of `@auaust/engrenage/prettier` and `defaultOptions` are gone.
- done: docs describe `prettier.config.ts` with `definePrettierConfig`.
