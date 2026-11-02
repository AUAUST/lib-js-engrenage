---
"@auaust/engrenage": patch
---

- Write in `tsconfig.tests.dist.json` only the fields that differ from `tsconfig.tests.json`, and remove the `include`, `exclude`, `target`, `lib` and `types` it inherits unless the `tests.dist` tsconfig configures them
