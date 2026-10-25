---
"@auaust/engrenage": minor
---

**Breaking:**

- `@auaust/engrenage/typescript` no longer exports `readSubpathImports`: read `config.packageJson.imports` from `loadConfig` instead.
- `syncBarrels` now takes `{ config, barrels, check }`, where `config` comes from `loadConfig`, instead of `{ root, barrels, check }`.
