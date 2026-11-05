# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: `data/agents/rules/git.md` says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. Plan #137 states superseded designs.

- why: Config pipeline: steps read sections through `get` (VS Code steps still go through `createEslintConfig`); the registry composes environment schemas (done in `project/environments`). Decisions: `library` preset `@debt` until #153 (landed). #137 and #165: only the `PostToolUse` edit hook.
- done: the plan matches the code.

## 3. The reference marker syntax is hand-written and conflicts go unreported

- sites: `src/tools/agents/setup/createBacklogStep.ts:69`, `src/tools/agents/setup/syncAgentFiles.ts:35`, `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse).
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. #9 ("Markers fail silently", marker grammar) covers it.
- want: folded into #9: one marker grammar from `markdownBlocks`; sync reports the conflict.
