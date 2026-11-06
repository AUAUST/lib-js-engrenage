---
"@auaust/engrenage": minor
---

- Breaking: remove `eslint.boundaries`; `auaust/import-environments`, `auaust/import-tests`, `auaust/import-data` and `auaust/import-workspaces` decide from the structure and take no policies
- Breaking: add `auaust/import-specifiers`, which reports relative specifiers an alias covers, self-imports and paths missing from the structure map, replacing `import-x/no-self-import` and `import-x/no-useless-path-segments`
- Breaking: tests no longer import an environment's root file
- Drop the `eslint-plugin-boundaries` dependency
