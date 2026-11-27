---
"@auaust/engrenage": minor
---

- Run `batiment` on nexus's own engine, resolving and validating each run before its action loads
- Print `batiment --help` as the contract of every command, and its usage errors through the run's printer, without Commander's `error: ` prefix
- Turn debug on for `metalbrain` with `METALBRAIN_DEBUG=1` and for `batiment` with `BATIMENT_DEBUG=1`, instead of `ENGRENAGE_DEBUG=1`
- Derive a program's debug variable from its root command's name in upper case followed by `_DEBUG`, and drop `debugVariable` from `RunSettings`
