# Codex instructions

This file is intended for OpenAI Codex. Other agents, including Claude Code, must ignore this file and use their own instruction entry points.

Codex loads this file instead of the root AGENTS.md. Before working, read and follow ./AGENTS.md as the shared project instructions.

## Rule mapping

Paths below are relative to the project root. Before editing a file, read and follow every rule whose glob matches that file. Read rules marked "All files" before any work. Multiple matching rules apply together. The paths frontmatter in each rule defines its scope; do not treat scoped rules as project-wide instructions.

<!-- @rules -->

| Matching glob | Rule to read |
| --- | --- |
| <code>.*.ts</code> | <code>.claude/rules/project-map.md</code> |
| <code>.*.ts</code> | <code>.claude/rules/project-map/tooling.md</code> |
| <code>.agents/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>.ai/backlog/*.md</code> | <code>.claude/rules/backlog.md</code> |
| <code>.ai/backlog/**</code> | <code>.claude/rules/budgets.md</code> |
| <code>.ai/backlog/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>.ai/issues/**</code> | <code>.claude/rules/budgets.md</code> |
| <code>.ai/issues/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>.ai/issues/**</code> | <code>.claude/rules/issue-drafts.md</code> |
| <code>.ai/issues/**</code> | <code>.claude/rules/issues.md</code> |
| <code>.ai/issues/**</code> | <code>.claude/rules/planning-sheet.md</code> |
| <code>.claude/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>.codex/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>*.config.ts</code> | <code>.claude/rules/project-map.md</code> |
| <code>*.config.ts</code> | <code>.claude/rules/project-map/tooling.md</code> |
| <code>**/*.ts</code> | <code>.claude/rules/code-style.md</code> |
| <code>**/*.ts</code> | <code>.claude/rules/prefer-toolkit.md</code> |
| <code>AGENTS.md</code> | <code>.claude/rules/instructions.md</code> |
| <code>AGENTS.override.md</code> | <code>.claude/rules/instructions.md</code> |
| <code>bin/**</code> | <code>.claude/rules/modules.md</code> |
| <code>bin/**</code> | <code>.claude/rules/project-map.md</code> |
| <code>bin/**</code> | <code>.claude/rules/project-map/bin.md</code> |
| <code>CLAUDE.md</code> | <code>.claude/rules/instructions.md</code> |
| <code>data/metalbrain/**</code> | <code>.claude/rules/agent-fragments.md</code> |
| <code>data/metalbrain/**</code> | <code>.claude/rules/instructions.md</code> |
| <code>package.json</code> | <code>.claude/rules/modules.md</code> |
| <code>scripts/**</code> | <code>.claude/rules/modules.md</code> |
| <code>scripts/**</code> | <code>.claude/rules/project-map.md</code> |
| <code>scripts/**</code> | <code>.claude/rules/project-map/scripts.md</code> |
| <code>src/**</code> | <code>.claude/rules/modules.md</code> |
| <code>src/**</code> | <code>.claude/rules/project-map.md</code> |
| <code>src/**</code> | <code>.claude/rules/project-map/src.md</code> |
| <code>tests/**</code> | <code>.claude/rules/modules.md</code> |
| <code>tests/**</code> | <code>.claude/rules/project-map.md</code> |
| <code>tests/**</code> | <code>.claude/rules/project-map/tests.md</code> |
| <code>tooling/**</code> | <code>.claude/rules/modules.md</code> |
| <code>tooling/**</code> | <code>.claude/rules/project-map.md</code> |
| <code>tooling/**</code> | <code>.claude/rules/project-map/tooling.md</code> |
| All files | <code>.claude/rules/agent-records.md</code> |
| All files | <code>.claude/rules/changesets.md</code> |
| All files | <code>.claude/rules/git.md</code> |
| All files | <code>.claude/rules/github.md</code> |
| All files | <code>.claude/rules/no-attribution.md</code> |

<!-- @end -->

## Dispatch

<!-- @dispatch -->

Use the installed workflows below when their descriptions match the request.

| Skill | Handling |
| --- | --- |
| `analysis` | Analyse a concern, design or part of the project in depth and record its ideal solution, its reach and a recommendation as issues or backlog entries. Use only when the user asks for an analyser to analyse, assess, rethink or review a concern, design or part of the project; never for implementing a decided change, for reviewing a diff or pull request for bugs, or for reviewing planned issues. Delegate to `analyser` when its description allows; otherwise run the skill yourself. |
| `planning` | Run its skill in the main session. Plan work as a tree of GitHub issues (a plan, ordered items, and segments grouping independent ones) without implementing it, in one pass or as an outer groundwork pass that inner planners deepen. Use proactively in the main session when the user asks to plan, scope, break down or design work, or to create, restructure or review planned issues, so its questions reach the user directly. |
| `debugging` | Investigate a problem, fix it at its root when the fix is contained, and otherwise write the fix up as an issue or backlog entry. Use only when a skill you follow or the user asks for a debugger. Delegate to `debugger` when its description allows; otherwise run the skill yourself. |
| `issue-implementation` | Implement one GitHub issue from a planned issue tree as written, without redesigning it. Use only when a skill you follow or the user asks for a worker. Delegate to `worker` when its description allows; otherwise run the skill yourself. |
| `walking` | Run its skill in the main session. Walk a planned tree of GitHub issues in order, dispatching each leaf to a worker or debugger, then reviewing and committing it. Use only when the user asks to walk an issue tree. |
| `merging` | Review what a walk landed across its leaves, integrating each concurrent leaf onto the walked branch and reviewing each segment at its close. Use only when a skill you follow or the user asks for a merger. Delegate to `merger` when its description allows; otherwise run the skill yourself. |
| `curation` | Turn the scratchpad, `@debt` markers, code clones and agent logs into backlog entries, filing the ready ones as issues where GitHub planning is on. Use when the user asks to triage the scratchpad, harvest debt markers or friction, or update, settle or file backlog entries. Delegate to `curator` when its description allows; otherwise run the skill yourself. |
| `instruction-writing` | Turn a behavior change the user consented to into agent instructions, grounded in current model guidance, and read them as each target agent would before reporting. Use for every change to instructions that determine agent behavior. Delegate to `writer` when its description allows; otherwise run the skill yourself. |

| Profile | Canonical role | Effort | Complexity |
| --- | --- | --- | --- |
| `analyser` | `analyser` | high | any other |
| `planner` | `planner` | medium | any other |
| `debugger` | `debugger` | medium | any other |
| `debugger_low` | `debugger` | low | `trivial` |
| `debugger_high` | `debugger` | high | `complex` |
| `worker` | `worker` | low | any other |
| `worker_medium` | `worker` | medium | `involved`, `complex` |
| `merger` | `merger` | medium | any other |
| `curator` | `curator` | high | any other |
| `writer` | `writer` | medium | any other |
| `writer_low` | `writer` | low | `trivial` |
| `writer_high` | `writer` | high | `complex` |

Spawn the named profile with Codex's spawn_agent tool (agent_type). Profiles inherit the session's selected model; do not supply another model. For a leaf, select the role's profile whose Complexity lists the leaf's `complexity`; otherwise its unsuffixed profile. A profile's effort takes precedence over a spawn effort override.
Spawn each leaf and the consultant with fork_turns: "none" and the brief the dispatching skill states, never pasting issue or plan content. Use send_input with its id to return questions, review gaps and gate failures to that same agent; use resume_agent first if it is closed. In clients exposing collaboration tools, use spawn_agent with the named role when supported, send_message for a running agent and followup_task for an idle agent. A client without named-profile selection cannot establish profile loading; report that unsupported path.

Spawn the planner profile only as the walker's consultant or reshaper, or as an inner planner an outer planning session dispatches; resume a running one with its existing id.

<!-- @end -->
