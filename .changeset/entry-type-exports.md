---
"@auaust/engrenage": minor
---

Every entry now re-exports all of its types, and the root entry every shared helper. New exports:

- `@auaust/engrenage`: `validate` (valibot validation with errors naming the subject and each failing key) and the read-only list types `Directories`, `Files` and `Globs`;
- `@auaust/engrenage/eslint`: `AuaustRules`, `PerfectionistRules` and `UnusedImportsRules`;
- `@auaust/engrenage/prettier`: `Options`;
- `@auaust/engrenage/typescript`: `BarrelMode` and `Tsconfig`.
