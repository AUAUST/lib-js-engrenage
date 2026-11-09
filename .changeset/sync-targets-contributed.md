---
"@auaust/engrenage": minor
---

- Let extensions, built-in or listed, contribute sync targets, run in order of the files they read and produce
- List the active sync targets in run order, with their flags, in `engrenage sync --help`
- Reject `changesets` as an `engrenage sync` target when `@changesets/cli` is not installed
