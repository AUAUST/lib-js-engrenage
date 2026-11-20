---
"@auaust/engrenage": patch
---

- Add a Claude Code `SessionStart` hook that sets zsh's `NO_NOMATCH` for the session's Bash commands, so an unquoted glob matching nothing reaches the command instead of aborting it
