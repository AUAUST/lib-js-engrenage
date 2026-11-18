# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. Attribution rule conflicts go unreported

- site: the `@debt` of `syncAttributionRules` in `src/tools/agents/setup/syncAgentFiles.ts`.
- why: a rule file at the wanted path without its reference silently drops the rule.
- want: sync reports the conflict.

## 2. The issue-drafts rules have three diverging copies, and the curator loads the planner for them

- why: §Drafts of `analysis.md`, `debugging.md`, `planning.md` differ (publish trigger, "keep analysing"); `curation.md` › File cites the `planning` skill. A nested `@reference` ends the skill's block.
- want: one source synced into every drafting skill, per #277; fallback: an always-loaded rule, ~35 lines per session.

## 3. Subagent skills repeat their finishing and report lines

- why: worker, debugger and merger share finishing lines; six skills repeat the report-once rule. Drifted: one-line items always (worker) vs with `Walk:` (debugger); "your issue's scope" vs "your input's reach".
- want: report rule in the writing section; gated lines generated from one source; a sync check on them.

## 4. Walked agents read whole plan issues for the sections their header names

- why: over 20 walks, `gh issue view` was 14% of worker tool output, mostly whole plans re-read by each leaf.
- want: a `planning issue` command printing an issue with only the ancestor sections its header names, for workers and debuggers.

## 5. `walk check` reprints the whole tree after every commit

- why: the walker runs it after each commit; closed subtrees and their `Closes` lines grow with the walk and stay in its context.
- want: an option collapsing closed subtrees to one line, used by the walking skill once trees reach dozens of issues.

## 6. `planning issue check` passes underspecified items

- why: it checks section presence and order only; items whose **Steps** left choices open surfaced mid-walk. The planning skill's §Readiness states the bar in prose.
- want: a finding per **Steps** item naming no path or identifier in code spans, and per **Tests** case without an expected outcome.

## 7. Whether an issue's text counts as consent to change instructions is undecided

- why: maintenance requires user consent, precedence lets issues carry maintainers' decisions; walked workers get issues editing `data/agents/`, and the writer skill's "Commit nothing" clashes with their checkpoints.
- want: user decision; proposed: session or maintainer-issue consent; the fallback keeps the role's commit rules.

## 8. Skills have no rank against the project's own rules

- why: `precedence.md` says a skill refines these instructions, but skills are shared text (rank 3) acting on project rules (rank 2).
- want: user decision; proposed: a skill refines shared rules for its role; project rules still win.

## 9. Always-loaded context carries rules only some edits need

- why: the TypeScript section and structure design rows (~110 words each) load for every agent; cold starts are a third of worker and planner cost (#654); a `paths` rule misses files written without a matching Read.
- want: accept that leak or move them to `code-style.md` and a project-map rule.

## 10. The planning sheet misses agents that write a draft before reading one

- why: three skills say it "loads with the first draft you read"; with `.ai/issues/` empty or listed through Bash, the first draft is a Write, which loads no `paths` rule.
- want: drafting skills Read `.claude/rules/planning-sheet.md` before their first draft unless a draft read loaded it.

## 11. Codex has no low-effort merger for integration

- why: `walking.md` dispatches the integration merger with `effort: low`; `merging.md` declares no `efforts`, and a Codex profile's effort overrides the spawn's.
- want: `efforts: { integration: low }` in the merging frontmatter, generating `merger_low`, routed by mode.

## 12. A restarted walk re-dispatches leaves whose work sits in leftover worktrees

- why: the walking skill's §Context covers compaction only; `walk check` lists such leaves as ready.
- want: on start, route ready work found in worktrees and `worker/*`, `debugger/*` branches to §Integration or §Review; report the rest.

## 13. The walker has no rule for colliding log appends or silent agents

- why: parallel leaves' `.ai/friction.md` appends conflict when applied; nothing follows 3 unanswered progress requests.
- want: keep both sides of log conflicts; hold the leaf after 3 more silent timeouts.

## 14. Gate failures outside an agent's change have no rule

- why: the worker's and debugger's "fix them and stop again" is unbounded; load timeouts and other sessions' files fail the gate (friction ×3).
- want: rerun once; still failing, report a blocker naming the files, editing none; the walker counts it as no resume cause.

## 15. A question asked mid-task can end the task

- why: the decision protocol's question row stops at answering; a literal agent answers and leaves its work half done and uncommitted.
- want: the row ends "then continue the task in progress".

## 16. Skill terms are undefined or carry several meanings

- why: "leaf" is never defined (walking, merging, Codex dispatch); the debugger's "reach" means sites sharing a cause, unlike AGENTS.md's; planning's "steps" means sub-issues, inner parts, Roadmap entries and the **Steps** section.
- want: define leaf in walking §Handling; the debugger says "sites"; planning says items, parts and Roadmap entries.
