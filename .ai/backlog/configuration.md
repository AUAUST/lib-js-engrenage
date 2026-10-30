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

## 4. Managed per-kind tsconfig layout.

- Where: `data/tsconfig/`, `src/typescript/setup/`, `src/vitest/config/createVitestConfig.ts`, `src/tsdown/config/createTsdownConfig.ts`, `src/eslint/`
- Done so far: the presets exist (`base.json` without `target`, `library.json` with `types: []` and `exactOptionalPropertyTypes`, `tests.json`, `node/24.json`, `library.dist.json` extending `tests.json`, `baseline/2026-10.json`), new libraries extend the newest baseline, and `engrenage typecheck` runs `tsc --build` on a tsconfig with references.
- Remaining (AUAUST/lib-js-toolkit#150, toolkit backlog `engrenage.7` and `engrenage.10`): a solution-style root (`files: []`, references to `tsconfig.src.json`, `tsconfig.tests.json`, `tsconfig.node.json`, build info under the cache root) that `engrenage sync` owns with `--check` drift reports; Vitest's `typecheck.tsconfig` pointing at the tests config instead of the root (a solution root checks nothing there); tsdown reading entries and `target` from the source config; ESLint typed rules resolving files through the references; an `engrenage.config.ts` option selecting the baseline snapshot. The Node tooling config (`tsconfig.node.json`) extends the `node/<major>.json` preset derived from `devEngines.runtime` (an exact major such as `"24"`), failing clearly when the field is missing, a range, or names a major without a preset; `engrenage init` writes that field.
- Open: whether `paths` stay in the root (the builders read them there) or move to the source config; which keys sync manages versus leaves to the project; include globs for tool configs outside the root.
- Done when sync owns the layout, every command checks or builds each kind with its own configuration and toolkit adopts it.

## 5. A cache root outside `node_modules` is not ignored.

- Where: `src/git/utils/createProjectIgnores.ts`, `src/config/utils/createResolvedConfig.ts`
- Problem: `cache.dir` moves every tool cache, but the ignore files only cover the default `node_modules/.cache` through `node_modules`; a cache root such as `.cache` would be committed and formatted.
- Fix: add the cache root to the project ignore groups when it is not already ignored, deciding how to detect that without listing `node_modules/.cache` in every project.
