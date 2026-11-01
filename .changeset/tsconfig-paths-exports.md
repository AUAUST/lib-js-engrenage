---
"@auaust/engrenage": minor
---

- Generate the package-name `paths` of the base tsconfig from `src.exports`, leaving every other alias untouched
- Write `paths: {}` in the `tests.dist` tsconfig so Node resolves the package through its `exports`
