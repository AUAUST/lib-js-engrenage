---
"@auaust/engrenage": minor
---

- Add the `agents.attribution` option: `false` hides Claude Code's commit and pull request attribution in `.claude/settings.json` and syncs a `no-attribution` rule, `true` drops engrenage's hiding value and syncs an `attribution` rule, and leaving it unset touches neither
- Write `attribution: false` into the config `engrenage init` generates
