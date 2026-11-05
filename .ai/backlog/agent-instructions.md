# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: `data/agents/rules/git.md` says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. Plan #137 states superseded designs.

- why: §Config pipeline: steps read sections through `get` (VS Code steps still go through `createEslintConfig`); the registry composes environment schemas (done in `project/environments`). §Decisions: `library` preset `@debt` until #153 (landed). #137 and #165: only the `PostToolUse` edit hook.
- done: the plan matches the code.

## 3. Option and command descriptions predate the #172 hooks and the `ConfigInput` rename.

- why: `agentsSchema` describes `claudeSettings` as "the edit hook"; the `createClaudeSettingsStep` prompt omits the budget and github hooks; `scripts/codegen/config.ts` describes "the documented Config interface" (now `ConfigInput`).
- done: descriptions and prompts match.

## 4. Length budget hooks miss bodies and repeat payload handling (#172).

- why: `gh issue edit` without `--title` is unclassified (plan budget); `--body "…"` and `--body-file` unparsed; words split raw markdown, inflating tables and links; four hook commands repeat payload parsing and `loadConfig`; Claude `if: "Bash(gh issue *)"` unverified; the Codex entry runs on every Bash call; an edit-hook `deny` cannot undo the write.
- want: classify edits through `gh`, parse both body flags, a shared hook-payload operation, verify `if`.
- done: oversized writes are measured however the body is passed.

## 5. Project maps repeat themselves and miss what an agent needs

- why: an src edit loads about 1,500 map words; the role table repeats in four maps with roles the environment never uses and no `public` flag; "Lint enforces every rule" sits beside ⚠ cells; column categories are undefined; test variants appear in the always-loaded map and in the structure section; the tooling map loads only for `tooling/**`, not the root config files; the bin map states no command contract; an empty tooling map is written.
- want: roles once with per-environment differences, defined categories, test rules in the tests map, `paths` from environment globs, no map for an empty environment, a bin contract.
- done: each fact appears once and every map statement matches lint.
