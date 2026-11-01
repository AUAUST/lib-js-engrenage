---
"@auaust/engrenage": minor
---

- `engrenage typecheck:dist` checks the `tests.dist` tsconfig and fails clearly when the variant is disabled, its file is missing or `tests` is inactive; `engrenage typecheck` fails when no environment is referenced (every `check` is false)
