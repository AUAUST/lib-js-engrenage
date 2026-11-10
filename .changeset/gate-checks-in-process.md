---
"@auaust/engrenage": patch
---

- Speed up the gate: `typecheck`, `structure --check` and `sync --check` run in the gate's process instead of a new `engrenage` process each, so only `tsc` is spawned; `sync --check` runs on its own copy of the config, so its staged files never reach the other checks
