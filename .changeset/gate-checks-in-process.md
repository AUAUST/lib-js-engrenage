---
"@auaust/engrenage": patch
---

- Speed up the gate: `typecheck` and `structure --check` run in the gate's process instead of a new `engrenage` process each, so only `tsc` is spawned
