---
"@auaust/engrenage": minor
---

Add the `@auaust/engrenage/config` entry and its `engrenage.config.ts` project file, which holds globally relevant values: `directories` (`source`, `test`), `files` (`code`, `test`, `config`, `discovered`, `generated`, `gitignore`) and `agents` (`instructionFiles`, `snippetsDirectory`). `defineConfig` types the file and accepts either the config object or a callback returning it, sync or async. That input shape is exported as `ConfigInput<Data>` from `@auaust/engrenage`, for every `define…Config` to share. `loadConfig(cwd?)` looks for `engrenage.config.*` in the current directory only (no upward search, no `.config/` directory), warns once and falls back to defaults when it is missing, and rejects unknown keys with an error naming the file and each key path. Values replace their default, except `files.generated`, which appends to the built-in lock files, `coverage/**` and the tsconfig `outDir`. The resolved config adds `root`, `package` (`name`, `description` and `version` from `package.json`, each `null` when the file or the key is missing), `typescript` (`outDir` and `paths` from `tsconfig.json`) and `resolve()`, which resolves a path against the root and rejects paths escaping it. `c12` and `valibot` are now runtime dependencies.

`engrenage agents sync` reads `agents.instructionFiles` from the config. A bare reference first resolves inside `agents.snippetsDirectory` when the file exists there, then as a package specifier. An unresolved reference fails, naming the reference and the file. `resolveAgentReference` is exported from `@auaust/engrenage/agents`.

**Breaking:**

- `engrenage agents sync` drops `--root`: run it from the project root.
- `syncAgentFiles` now takes `{ config, check }`, where `config` comes from `loadConfig`, instead of `{ root, check }`.
- `@auaust/engrenage/eslint` no longer exports `baseRules`, `importRules`, `promiseRules`, `stylisticRules`, `syntaxRestrictions`, `sourceSyntaxRestrictions`, `restrictedProperties`, `misplacedTestRestriction`, `testDirectories`, `testFiles`, `toolConfigFiles` or `typescriptFiles`. The global values are now the defaults of `directories.test`, `files.test`, `files.config` and `files.code`.
- `@auaust/engrenage/agents` no longer exports `agentFiles` (now the default of `agents.instructionFiles`) or `markdownBlocks`.
- `@auaust/engrenage/typescript` no longer exports `barrelFiles` or `typescriptBlocks`.
- `@auaust/engrenage/prettier` no longer exports `prettierOptions` by name: use its default export.
- `@auaust/engrenage` no longer exports `resolvePath`, now an internal helper.
- The shipped data files move from `config/` to `data/` in the package. The public paths `@auaust/engrenage/tsconfig/*.json` and `@auaust/engrenage/agents/{rules,sections}/*.md` are unchanged.
