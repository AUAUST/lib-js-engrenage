---
"@auaust/engrenage": minor
---

- **Breaking**: Replace the `agents.budgets` keys `plan`, `block` and `task` with `goal`, `context`, `doneWhen`, `comment`, `backlogEntry` and `debtEntry`, beside a `warn | deny` mode. Upgrade: rename the keys you set.
- **Breaking**: Remove the `edit` hooks and commands; `engrenage sync` drops them from `.claude/settings.json` and `.codex/hooks.json` and removes stale engrenage hooks, leaving the project's own. Upgrade: run `engrenage sync`.
- Add `engrenage gate [--staged | --worktree]`, fixing and checking the changed files (ESLint, Prettier, types, structure, sync, related tests, `agents.gate.commands`) and warning on over-budget backlog or debt entries; the `agents.gate` option; and the lefthook init step with `engrenage sync lefthook`, running the gate before agent commits
- Add `engrenage issues check <number>`, checking an issue against the issue contract; untyped bodies with neither **Goal** nor **Steps** get no structure check
- Add `engrenage agents claude|codex hook github`, checking every `gh issue create|edit|comment` of a shell command, bodies piped from `.draft.md` files included, against the issue contract and the **Goal**, **Context** and **Done when** budgets
- Add `engrenage agents claude hook dispatch`, denying `worker` or `debugger` dispatches whose issue is not ready
- Add `engrenage agents claude hook git` and matching settings rules, denying `--no-verify`, `LEFTHOOK=0` and `core.hooksPath` bypasses of the commit gate
- Add `gate: true` to skill `agent:` blocks, syncing a `Stop` hook that sends a subagent back once with the gate's failures
- Exit hook commands with code 2 and a message when they cannot load the CLI
- Add `effort` to skill `agent:` blocks and the `agents.subagentCacheTtl` option (`1h`, synced into `subagentPromptCacheTtl`), and fit each shipped agent's model and effort to its role
- Generate a project map overview in `.claude/rules/project-map.md` and one map per environment, loaded only for its files, pointed to by the default `structure` AGENTS.md section
- Add the `writing` AGENTS.md section, on by default, with density, structure and length rules for everything agents write
- Add the `issue-walking` skill, walking a planned issue tree and dispatching each task to a worker before reviewing and committing it
- Write plans as indexes and tasks as deltas naming their ancestors, with nested plans bounding what workers read
- Draft planner and debugger issue edits in `.ai/issues/` and publish them in one flush, weigh user requests in the decision protocol, and dispatch Complexity `Trivial` issues at low effort
- Remove links to engrenage repository documents from the shared skills
