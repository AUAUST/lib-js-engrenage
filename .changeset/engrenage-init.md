---
"@auaust/engrenage": minor
---

- Add `engrenage init` to set up a project, or add the pieces it is missing on later runs
- `engrenage sync` only updates existing files; `init` creates them
- Write all synced files at once and restore them when a write fails
