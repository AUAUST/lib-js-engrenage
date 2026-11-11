# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: `data/agents/rules/git.md` says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. The reference marker syntax is hand-written and conflicts go unreported

- sites: `src/tools/agents/setup/createBacklogStep.ts:69`, `src/tools/agents/setup/syncAgentFiles.ts:35`, `:40`, `src/foundation/blocks/utils/syncBlocks.ts:35` (skips `@debt` comments the marker regex reads as directives), `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse).
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. #9 ("Markers fail silently", marker grammar) covers it.
- want: folded into #9: one marker grammar from `markdownBlocks`; sync reports the conflict.

## 3. The issue-drafts protocol and GitHub mechanics are copied in three skills and have drifted

- why: the Drafts sections of `debugging.md`, `issue-planning.md` and `analysis.md` differ only in flush triggers and creation order; AUAUST/lib-js-engrenage#461 shrinks them to the planning commands and drops their GitHub mechanics.
- want: one source each skill opts into, per #277 (skill traits).

## 4. The worker and debugger skills repeat their gated finishing lines word for word

- why: the final-report, worktree-gate and stop-gate lines in the Finishing sections of `issue-implementation.md` and `debugging.md` are identical and must change together.
- want: one source for agents with `gate: true`, generated into each, once the copies start to drift.
