---
"@auaust/engrenage": minor
---

- Remove the `edit` hooks and commands; `engrenage sync` drops them from `.claude/settings.json` and `.codex/hooks.json`
- Sync every hook engrenage produces and remove the stale ones, leaving the project's own hooks alone
- Register the Claude GitHub hook only for `gh issue create|edit|comment`
- Exit 2 with a message when a hook command cannot load the CLI
