---
"@auaust/engrenage": minor
---

- Make nexus's `launch` take a loader resolving to the program and its run settings, enabling Node's module compile cache before loading it unless `compileCache: false`
- Export the `ProgramLaunch` type from `future/nexus/cli`
