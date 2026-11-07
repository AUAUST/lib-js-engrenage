---
"@auaust/engrenage": minor
---

- **Breaking**: the root entry no longer exports `loadConfig`, `loadValidatedConfig` and `LoadedConfig`; import them from `@auaust/engrenage/config`
- **Breaking**: the root entry no longer exports `syncBlocks`, `syncFiles` and `syncIgnoreFile` (now `@auaust/engrenage/blocks/internals`), `filesIn` (`@auaust/engrenage/filesystem/internals`) and `validate` (`@auaust/engrenage/options/internals`), with no stability guarantee
- `engrenage structure` reads `typescript.verbatimModuleSyntax`: without it, an import used only as a type no longer counts toward an import cycle
