---
"@auaust/engrenage": minor
---

- Remove Codex support: the `./agents/codex` export, its hooks, skills, profiles and init steps
- Delete on sync the Codex files earlier releases generated, keeping the project's own `.codex/hooks.json` entries
- Reject `codex` in `agents.preferred` and the `codexHooks` option, naming the removal
