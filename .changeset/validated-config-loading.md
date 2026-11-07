---
"@auaust/engrenage": minor
---

- Replace the root entry's `validateConfig` with `loadValidatedConfig(cwd?, options?)`, which loads the config and validates it once, reporting every failing section at once
- Remove `raw` from `LoadedConfig` and from the ESLint convention config
- Validate each config section once per loaded config
- Resolve the `github.workflows` and `tests.dist.tsconfig` defaults in the config: `ResolvedGithub.workflows` is never `undefined` and `workflowsConfigured` tells whether it was set; `ResolvedBuild.configuredOutDir` exposes the configured `build.outDir`
- Reject a config file whose default export is neither an object nor a function returning one, instead of reading it as an empty config
