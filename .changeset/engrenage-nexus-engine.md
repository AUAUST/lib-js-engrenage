---
"@auaust/engrenage": patch
---

- Run `engrenage` on nexus's own engine, resolving and validating each run before its action loads
- Accept a program declaration in `runProgram`, and export `program`, `ProgramDeclaration` and `RunSettings`
- Print usage errors through the run's printer, without Commander's `error: ` prefix, so `--silent` hides them
- Print `engrenage --help` as the contract of every command
- Name the group of an unknown command in a nested help path
