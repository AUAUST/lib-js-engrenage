---
"@auaust/engrenage": patch
---

- Scope a `.namespace.json` `imports` grant to some directories of its target with `{ "relation": …, "dirs": […] }`, so import lint, JSX settings and source declarations reach only those directories
- Report a granted directory its target does not span as `unknown-import-directory`
