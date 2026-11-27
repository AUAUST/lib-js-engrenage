---
"@auaust/engrenage": minor
---

- Remove `createProgram` from `future/nexus/cli`; declare programs with `program` instead
- Remove `commandRegistration`, `commandExtension` and `commandForwarding` from `future/nexus/cli/constants`
- Make `runProgram` take only a program declaration, dropping its `scenarios` and `detectors` settings in favour of the program's own
- Stop bundling Commander into the package
