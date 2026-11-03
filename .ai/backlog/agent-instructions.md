# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. Commit messages should prefer commas over "and".

- Matter: the commit message rules (`git.md` rule fragment) say to name what changes have in common when "and" would be needed; they should also prefer comma separation to "and" when listing.
- Done when the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. A `walking-the-dog` skill for orchestrating an issue's tasks.

- Request: a skill that, given an issue number, makes the agent an orchestrator for that issue: it dispatches each task or sub-task sequentially until completion. Example invocations: "start dispatching workers on the issues of <issue URL>" and "walk the issues".
- Behavior:
  - Assign a worker to the first leaf issue; on completion, quickly review the changes, commit them, then dispatch the next worker on the next task.
  - During review, add the `@debt` markers a worker missed on improvable code.
  - Reuse a worker only when the tasks are scoped and shared context benefits both; otherwise cold-start with only the required context.
  - Ask the user for validation or answers only for worker questions that the plan's goals and progress cannot answer.
  - At each round, send the user a TL;DR of what the worker changed and committed, so the choices made are visible.
- Open: skill name and its place among `data/agents/skills/`.
- Done when the skill exists in the shared fragments and is synced.

## 3. Backlog entries and GitHub issues are too verbose to scan.

- Matter: entries should be much denser; agents currently open many issues of about two pages each, which overwhelms. Entries must stay clear and exhaustive, not be compacted at any cost.
- Expected: instructions (`index.md` source, backlogger and planner skills, issue-writing guidance) push toward keyword-style content (key points, actions, context) over long explanatory sentences, applied to both backlog entries and GitHub issues. Finding the right phrasing is part of the work.
- Done when the instructions state it, and verbose entries are shortened.
