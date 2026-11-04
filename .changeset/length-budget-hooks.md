---
"@auaust/engrenage": minor
---

- Add the `agents.budgets` option: word budgets per text kind and a `warn | deny` mode
- Warn from the edit hooks when a backlog or debt entry is over budget
- Add the `engrenage agents claude|codex hook github` commands, synced as `PreToolUse` hooks, to warn or deny an oversized `gh issue create|edit|comment`
