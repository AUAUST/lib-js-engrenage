---
"@auaust/engrenage": minor
---

- Remove the `engrenage-hook` binary; run `engrenage sync` to rewrite hook entries still naming it to `metalbrain hook`
- Remove `hookProgram` and `hookProgramSource` from `@auaust/engrenage/constants`
- Default a `HookDefinition` without `program` to `metalbrain`
