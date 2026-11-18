# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 2. The reference marker syntax is hand-written and conflicts go unreported

- sites: `src/tools/agents/setup/createBacklogStep.ts:69`, `src/tools/agents/setup/syncAgentFiles.ts:35`, `:40`, `src/foundation/blocks/utils/syncBlocks.ts:40` (skips `@debt` comments the marker regex reads as directives), `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse).
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. #442 takes up #9's marker grammar (#9 closed).
- want: tracked by #442: one marker grammar owned by extensions; sync reports the conflict.

## 3. The issue-drafts protocol is copied in three skills

- why: since AUAUST/lib-js-engrenage#461, the Drafts sections of `debugging.md`, `planning.md` and `analysis.md` share their file, manifest and reference tables and their rules word for word; only the opening sentence differs, and every change must be made three times.
- want: one source each skill opts into, per #277 (skill traits).

## 4. The walked agents' skills repeat their gated finishing lines word for word

- why: `issue-implementation.md` and `debugging.md` share their final-report, gate, worktree setup and merger-findings lines; the one-line report rule also repeats in `merging.md`.
- want: one source for agents with `gate: true`, generated into each, once the copies start to drift.

## 5. Walked agents read whole plan issues for the sections their header names

- why: over 20 walks, `gh issue view` was 14% of worker tool output, mostly whole plans re-read by each leaf.
- want: a `planning issue` command printing an issue with only the ancestor sections its header names, for workers and debuggers.

## 6. `walk check` reprints the whole tree after every commit

- why: the walker runs it after each commit; closed subtrees and their `Closes` lines grow with the walk and stay in its context.
- want: an option collapsing closed subtrees to one line, used by the walking skill once trees reach dozens of issues.
