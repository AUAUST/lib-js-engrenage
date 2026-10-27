---
"@auaust/engrenage": minor
---

- Add `engrenage claude hook edit`, which fixes, formats and lints the file a Claude Code edit touched and reports the remaining lint errors to the agent
- Add the hook to `.claude/settings.json` through `engrenage init` and the `claude` sync target, opted out with `agents.claudeSettings: false`
- Shorten the shared code-style rules to the lint conventions that are not fixed automatically
