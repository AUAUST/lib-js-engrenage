---
"@auaust/engrenage": minor
---

- Write the solution base tsconfig: `files: []` and `references` to every owned environment tsconfig with `check: true`
- Write `compilerOptions.tsBuildInfoFile` in every environment tsconfig, under `<cache.dir>/typescript`
- Write `skipLibCheck: false` in the `tests.dist` tsconfig
