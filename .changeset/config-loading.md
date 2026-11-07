---
"@auaust/engrenage": minor
---

- **Breaking**: Pass `loadConfig` and the callbacks of `defineEslintConfig`, `defineViteConfig`, `defineTsdownConfig`, `defineVitestConfig` and `definePrettierConfig` a `LoadedConfig` read section by section, instead of the flat config. Upgrade: replace each `config.<key>` with `await config.resolve(<key>Section)`, imported from `@auaust/engrenage` (`sourceSection`, `buildSection`, `gitSection`…); read `src.exports` through `sourceExportsSection`, `typescript.tsconfig.path` through `tsconfigPathSection` and `build.outDir` through `buildOutDirSection`.
- **Breaking**: Stop validating in `loadConfig` and replace `validateConfig` with `loadValidatedConfig(cwd?, options?)`, which validates once and reports every failing section and unknown top-level key. Upgrade: call `loadValidatedConfig` where the config must be valid.
- **Breaking**: Limit `@auaust/engrenage/config` to `defineConfig`, `define`, `loadConfig`, `loadValidatedConfig`, `ConfigInput`, `LoadedConfig` and `Resolvable`. Upgrade: rename the `Config` type to `ConfigInput` and the value-or-function helper to `Resolvable`; import `ResolvedAgents`, `ResolvedGit`, `ResolvedGithub`, `ResolvedPrettier` and `ResolvedVscode` from their tool entries and `PackageJson` from `@auaust/engrenage/package`; drop `createContext`, `ResolvedConfig`, `InlineRole`, `sourceTestsVariant` and `distTestsVariant`.
- **Breaking**: Move `root`, `filesystem` and `configFile` to `config.context` and remove `raw` from `LoadedConfig` and the ESLint convention config. Upgrade: `resolve(...paths)` becomes `config.context.path(...paths)`, `cacheFor(name)` becomes `(await config.resolve(cacheSection)).for(name)`.
- **Breaking**: Make `createEslintConfig`, `createPrettierConfig`, `createTsdownConfig`, `createViteConfig` and `createVitestConfig` async, taking the `LoadedConfig` first. Upgrade: `await createViteConfig(config, …)`.
- **Breaking**: Make `formatFile` and every file read, write, glob and process of config loading, `init`, `sync` and the CLI async, and the `gitignore`, `prettierignore` and per-environment `tsconfig.path` fields promise-valued. Upgrade: `await` them.
- **Breaking**: Reject a config file whose default export is neither an object nor a function returning one. Upgrade: export the config object or its function.
- Load the config once per project root, shared by the CLI and the definers; `loadConfig.refresh(root)` reloads `engrenage.config.ts`
- Declare every option's default, shown as `@default` in the generated JSDoc and filled in the loaded config; fail `src.apis` and `inherits` conflicts when their section is read
- Add the `format` section (`indent`, `indentWidth`, `lineWidth`, `quotes`, `semicolons`, `trailingCommas`, `endOfLine`), defaulting to the former fixed conventions
- Resolve the `github.workflows` and `tests.dist.tsconfig` defaults in the config, with `ResolvedGithub.workflowsConfigured` and `ResolvedBuild.configuredOutDir` exposing what was set
