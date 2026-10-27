---
"@auaust/engrenage": minor
---

- Root `engrenage init` at the working directory and start a package from an empty directory with `pnpm init --bare`
- Ask the project type first and use it as the default for the following questions; `--yes` takes every default
- Ask the package name and visibility, and set `version`, `license`, `private` and `author` when missing
- Ask the build tool (tsdown, Vite or none) and whether to test with Vitest, and create the matching config files
- Create a missing `tsconfig.json` and, for libraries, `tsconfig.dist.json`
- Add the standard scripts for the chosen tools instead of failing placeholder scripts
- Resolve `packageJsonPath`, `tsconfigPath` and the other file locations through `config.filesystem` when read; a missing configured file now fails when read instead of when the config loads
- Read tsconfig files inside the project through `config.filesystem`
- Change `defineViteConfig` to take options first, with a `test` layer, and set `resolve.tsconfigPaths` in `createViteConfig`
- Add `createVitestLayer`; `createVitestConfig` now returns only the test overrides and `defineVitestConfig` builds on `defineViteConfig`
