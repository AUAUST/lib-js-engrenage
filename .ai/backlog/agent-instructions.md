# agent-instructions

Agent instruction resolution and synchronization.

## 1. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.

## 2. No tool authorization presets for agent settings.

- Problem: tools irrelevant to a project (browser preview, iOS Simulator, Chrome, visualization, artifacts, notebooks) are denied by hand in this repository's `.claude/settings.json`. Every project repeats that list, and the docs connector entry is an account-specific ID checked into a shared file.
- Context: `syncClaudeSettings` only merges the edit hook today. Engrenage presets already describe the project kind (library, app, browser runtime), which decides which tools help.
- Expected: engrenage manages `permissions.deny` (and Codex equivalents where they exist) from tool authorization presets derived from the project's engrenage presets, overridable in `engrenage.config.ts` to allow or deny more, with account-specific entries kept out of shared files.
- Done when `engrenage sync claude` writes preset-derived tool permissions, project overrides apply, and this repository's hand-written list is replaced by them.

## 3. The planner stops investigating early and leaves questions for the worker.

- Matter: the planner tends to record open questions on issues instead of investigating them and exploring possible answers, which turns "do the search" into a step for the worker.
- Context: `data/agents/skills/issue-planning.md` lets an open question never delay an issue (section "Decisions and questions"), and its grounding step only requires inspecting affected code.
- Expected: the planning instructions require the planner to investigate each question and explore candidate answers first, leaving under **Questions** only what investigation cannot settle (real choices for the user), never research a worker could be handed.
- Done when the issue-planning skill states that rule and the question table reflects it.

## 4. Backlog entries are not removed after the planner or backlogger files them as issues.

- Matter: the planner did not delete backlog entries after turning them into issues, although `.ai/backlog/index.md` says to remove an entry (or reduce it to what the issue leaves here) once an issue tracks its work.
- Context: a search of `data/agents` finds no "delete after the issue is closed" wording; the removal rule exists only in the backlog index, while `data/agents/skills/backlog-handling.md` (filing step) and `data/agents/skills/issue-planning.md` do not tell the agent to remove the entry right after creating the issue. The planner's skill only mentions backlog IDs as prerequisites.
- Expected: every skill that creates an issue from a backlog entry removes or reduces that entry in the same run, linking the issue, with the rule stated where the agent acts (and nothing implying removal waits for the issue to close).
- Done when the planner and backlogger instructions state immediate removal after issue creation, and a run leaves no entry duplicating a created issue.

## 5. No shared instruction for writing commits.

- Matter: nothing in the shared agent fragments explains how to write a commit message.
- Expected: a short rule (in a fragment under `data/agents/`, likely a section or rule file synced to projects) stating: a `<type>: <short context>` subject with a type prefix; no co-authoring trailer; `Closes #<n>` when the commit resolves an issue; `Towards #<n>` when the work relates to an issue without closing it.
- Prefix list: the last 300 commits use `imp`, `fix`, `feat`, `meta`, `config`, `snap`, `docs`, `tests`, `cq` (with `files` and `contents` as rare outliers). Which of these the shared rule names, and their meanings, is a decision: the list is repository history, not a documented convention, and shared fragments must stay project-agnostic. A saved user preference names only `fix`, `imp`, `feat`, `tests`.
- Precedence: the harness attribution reminder asks for a co-author line, and its own text yields to the project's instructions. The rule must state that the project's commit rule overrides any tool-injected trailer or attribution for commits and says so explicitly.
- Done when synced AGENTS.md or rules carry the commit convention.

## 6. The "no comments" instruction was weakened by the `@debt` exception.

- Matter: agents add useless descriptive comments since the instruction was relaxed to allow `@debt` markers.
- Context: `data/agents/sections/implementation.md` lists the comment exception as one sentence combining technical reasons, tool directives and `@debt` markers.
- Expected: restate the prohibition more strongly and separately from the `@debt` allowance (default is no comment; the only exceptions are named and narrow), keeping the debt-markers rule intact.
- Done when the fragment is reworded, synced with `pnpm engrenage sync agents`, and new agent output stops adding descriptive comments.
