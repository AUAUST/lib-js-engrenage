# configuration

Configuration ownership, project roots and refresh lifecycles.

## 1. The tsconfig `outDir` can diverge from the configured output directory.

- Where: `src/config/`, `src/typescript/`
- Problem: `build.outDir` in `engrenage.config.ts` overrides the tsconfig `compilerOptions.outDir` for tsdown, Vite, Vitest and the ignore files, but the tsconfig keeps its own `outDir`, so `tsc` and editors still see the old one.
- Fix: add an opt-in `engrenage sync` option that writes the configured output directory into the tsconfig `compilerOptions.outDir` when `build.outDir` is set, and leaves the tsconfig alone otherwise. Decide where the option lives and how it treats an `outDir` inherited through `extends`.

## 2. Definers cannot load a project above the working directory.

- Where: `src/eslint/config/defineEslintConfig.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/vite/config/defineViteConfig.ts`, `src/vitest/config/defineVitestConfig.ts`
- Problem: `loadConfig()` now searches from `process.cwd()` upward to the nearest `package.json`, which covers tools running from a subdirectory of the project. A tool running from above or beside the project (an editor ESLint server opened at a workspace root, `vite --config other/vite.config.ts`, Vitest projects) still roots the config at the wrong directory. The former API took `root: new URL("./", import.meta.url)`.
- Fix: let definers accept an explicit root. Options can be callbacks receiving the resolved config, so the root cannot live in them: decide where it goes in each definer's signature.

## 3. Long-lived processes keep the first loaded config.

- Where: `src/config/utils/loadConfig.ts`, `src/config/utils/createFilesystem.ts`
- Problem: `loadConfig` caches one promise per root for the whole process (only failed loads are retried), and `config.filesystem` keeps every file it read, so package.json and tsconfig edits are not seen. Vite and Vitest in watch mode or an editor's ESLint server keep the first `engrenage.config.ts` after edits.
- Fix: decide how long-lived processes refresh the cache, for example by comparing the config file's modification time.
