---
"@auaust/engrenage": patch
---

- Refuse agent commit subjects without a commit type from the git rule, and agent commit bodies other than `Closes`/`Towards` lines
- Refuse agent commit attribution lines when `agents.attribution` is `false`
- Refuse agent commits raising counts in `eslint-suppressions.json`
- Deny `git push` in Claude settings
