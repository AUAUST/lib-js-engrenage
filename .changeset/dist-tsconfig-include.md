---
"@auaust/engrenage": patch
---

- Type-check only the plain and `.dist` tests, the setup file and the declarations in the `tests.dist` tsconfig, so `.src` tests no longer bring source into `typecheck:dist`
