---
"@auaust/engrenage": minor
---

- `createVitestConfig` passes the `tests` tsconfig (the `tests.dist` one in build mode) as `test.typecheck.tsconfig`, so test type checks run on a solution base; the top-level `tsconfig` stays on the base for the package-name `paths`
