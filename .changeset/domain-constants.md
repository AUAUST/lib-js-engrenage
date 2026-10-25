---
"@auaust/engrenage": minor
---

Expose each domain's constants as an entry, so projects can reuse engrenage's defaults: `@auaust/engrenage/config/constants` (global config defaults such as `defaultCodeFiles`, `defaultSourceDirectories`, `defaultFixtureFiles`, `builtinGeneratedFiles`, and known file names), `@auaust/engrenage/eslint/constants`, `@auaust/engrenage/typescript/constants`, `@auaust/engrenage/agents/constants` and `@auaust/engrenage/prettier/constants` (`defaultOptions`, also the default export of `@auaust/engrenage/prettier`).
