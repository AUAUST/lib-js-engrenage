---
"@auaust/engrenage": minor
---

- Run the lint on edit as `metalbrain hook claude PostToolUse lintEdit`, noticing a lint failure instead of dropping it
- Run the gated agents' stop gate as `metalbrain hook claude Stop gateStop`, blocking with a `block` decision instead of exit code 2
- Remove `engrenage-hook claude PostToolUse` and `engrenage-hook claude Stop`; run `engrenage sync` to update the hooks and agent files
- Add `blockStop` to `@auaust/engrenage/future/metalbrain/runtimes`
