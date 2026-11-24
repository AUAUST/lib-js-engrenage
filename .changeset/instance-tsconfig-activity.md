---
"@auaust/engrenage": patch
---

- Skip the tsconfig of an environment instance holding no file of its own in its languages, outside other environments' placements nested in it
- Write `tsconfig.tests.dist.json` only for an active root `tests` environment instance, and fail a dist test or typecheck run without one
