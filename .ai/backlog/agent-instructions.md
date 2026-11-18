# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 2. The reference marker syntax is hand-written and conflicts go unreported

- sites: `src/tools/agents/setup/createBacklogStep.ts:69`, `src/tools/agents/setup/syncAgentFiles.ts:35`, `:40`, `src/foundation/blocks/utils/syncBlocks.ts:40` (skips `@debt` comments the marker regex reads as directives), `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse).
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. #442 takes up #9's marker grammar (#9 closed).
- want: tracked by #442: one marker grammar owned by extensions; sync reports the conflict.

## 3. The issue-drafts protocol is copied in three skills

- why: since AUAUST/lib-js-engrenage#461, the Drafts sections of `debugging.md`, `planning.md` and `analysis.md` share their file, manifest and reference tables and their rules word for word; only the opening sentence differs, and every change must be made three times.
- want: one source each skill opts into, per #277 (skill traits).

## 4. The worker and debugger skills repeat their gated finishing lines word for word

- why: the final-report, worktree-gate and stop-gate lines in the Finishing sections of `issue-implementation.md` and `debugging.md`, their worktree setup line and their merger-findings resume line, are near-identical and must change together.
- want: one source for agents with `gate: true`, generated into each, once the copies start to drift.
