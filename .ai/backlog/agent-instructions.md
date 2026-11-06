# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: `data/agents/rules/git.md` says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. The reference marker syntax is hand-written and conflicts go unreported

- sites: `src/tools/agents/setup/createBacklogStep.ts:69`, `src/tools/agents/setup/syncAgentFiles.ts:35`, `createAgentsStep`, `createInstructionFile`, `getMissingRuleTemplates` (regex re-parse).
- why: `markdownBlocks` already describes the syntax; a rule file at the wanted path without its reference silently drops the rule. #9 ("Markers fail silently", marker grammar) covers it.
- want: folded into #9: one marker grammar from `markdownBlocks`; sync reports the conflict.

## 3. The planner does not adapt its updates to the user's mood

- why: agents are eager to accept any user input as truth and final, disregarding the shift of trajectory and major impacts it may cause.
- want: the planner asks the user's mood before writing or changing large plan sections. Jolly: it states each significant change, including a minor-looking requirement that shifts the plan's trajectory. Serious: concise, precise updates, significant changes stated directly. before writing large changes, the planner asks for confirmation; when the planner detects a request that seems to be taken lightly in comparison to the significance of the changes, it seeks clarification from the user. it provides options: "Jolly, clarify impacts first", "Serious, but do highlight impacts", "Serious, i know what I'm doing"
- done: when a seemingly minor request has large impacts on the plan's trajectory, the planner clearly states the changes and what their implications are for the overall plan; it is done before any large write occurs.

## 4. A stopped planning session can lose its state

- want: the planner stops each round in a clear state: questions are written into the issue before they are asked, so any fresh planner resumes from the issue alone.
