---
"@auaust/engrenage": minor
---

`importOrder` reads the project tsconfig, so imports through any path alias (`$lib/…`, `§/…`) sort with the project imports instead of the packages. Imports are classified with TypeScript's module resolution.

`Convention.rules` and the `rules` of `defineConvention` accept a function of the resolved config, for rule options that depend on the project.
