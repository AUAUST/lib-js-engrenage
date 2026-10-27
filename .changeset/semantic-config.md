---
"@auaust/engrenage": minor
---

- Group `engrenage.config.ts` by meaning instead of by kind, and mirror the groups on the resolved config:
  - `code: { files, configFiles, discoveredFiles }`
  - `source: { dirs }`, `bin: { dirs }`, `scripts: { dirs }`, with `src`, `bin` and `scripts` as defaults
  - `test: { dirs, files, fixtureFiles, coverageDir }`
  - `build: { outDir, emptyOutDir }`
  - `codegen: { files }`
  - `typescript: { tsconfig, distTsconfig }`, `git: { gitignore }`, `prettier: { prettierignore }`
  - `agents: { instructionFiles, snippetsDir }`
- Remove `directories`, `files`, `tsconfigPath`, `distTsconfigPath`, `gitignorePath` and `prettierignorePath` from the resolved config
- Accept a single string or an array for every input list, including `presets`
- Rename the ESLint convention scopes to `code`, `config`, `discovered`, `testFiles`, `source`, `bin`, `scripts`, `tests`, `public` (source and bin) and `private` (tests and scripts)
- `filesIn` takes one or more directories and globs and returns every combination
