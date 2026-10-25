# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Vite native config loader warning.
   - Where: `vitest.config.ts`
   - Problem: Vite warns that the extensionless `./src/…` imports are unsupported by `configLoader: 'native'`, planned as the future default.
   - Fix: once Vite makes the native loader the default, import the config helpers with explicit extensions or through `#…` subpath imports.

2. Vitest config from the resolved config.
   - Where: `vitest.config.ts`, `src/vite/`
   - Problem: `vitest.config.ts` still reads the tsconfig by hand, turning `paths` into Vite aliases and checking that `outDir` and `paths` are set, while `defineTsdownConfig` already takes them from the resolved engrenage config.
   - Fix: add a `defineVitestConfig` builder that takes `outDir` and `paths` from the resolved config, as `createTsdownConfig` does.

3. Barrel codegen cannot heal a barrel that names a removed module.
   - Where: `bin/support/codegen/index.ts`, `bin/support/codegen/rules.ts`
   - Problem: the `support` CLI registers every codegen subcommand at startup, and the `rules` subcommand imports the ESLint config builder and with it every conventions barrel. Renaming or deleting a convention module therefore crashes `pnpm support codegen barrels` with `ERR_MODULE_NOT_FOUND` before it can rewrite the stale barrel line, which has to be fixed by hand first.
   - Fix: decouple subcommand registration from their implementations so the barrels command never evaluates the modules it generates; a lazy dynamic import conflicts with the `noDynamicImport` convention, so this needs a deliberate loading pattern for CLI subcommands.

4. Shared project files beyond tool configs.
   - Where: `bin/engrenage/`, `src/config/`
   - Problem: only tool configs (ESLint, Prettier, TypeScript, Vite) and agent instructions are shared. Other files that repeat hard-coded content across AUAUST projects, such as `.gitignore`, `.vscode/settings.json`, `.vscode/extensions.json`, `.editorconfig` and `.gitattributes`, are still copied by hand and drift apart.
   - Fix: add an `engrenage sync` command that builds these files from shared content plus project options in `engrenage.config.ts`, with a `--check` mode for CI. Fold `engrenage agents sync` into it rather than running a parallel mechanism. Not yet scoped as an issue: the file list, config shape and merge policy depend on point 1.5.

5. Classify shareable files by how they can be extended.
   - Where: `data/`, the candidate files listed in point 1.4
   - Problem: some formats have native extension (`extends`, imports, includes) and can consume shared content directly, while others (VS Code settings, `.editorconfig`, `.gitignore`, `.gitattributes`) have none and must be fully generated, merged with project-owned content, or filled through marked blocks like the agent fragments. This is not yet known per file, nor whether project additions survive regeneration.
   - Fix: inventory each candidate file, record whether it extends natively, merges, or is fully rewritten, and decide where project-specific additions live, before designing `engrenage sync`.

6. Canonical `package.json` order.
   - Where: `package.json`, `src/prettier/` or `src/eslint/`
   - Problem: nothing enforces a key order in `package.json`, so manual edits and generated fields (tsdown `exports`, new imports or peer dependencies) land in arbitrary positions.
   - Fix: add a Prettier or ESLint plugin to the shared config that sorts `package.json` in a canonical order.

7. Dedicated `@auaust` import group.
   - Where: `src/eslint/conventions/imports/importOrder.ts`
   - Problem: perfectionist's import order sorts `@auaust/*` packages among the other external imports, so AUAUST libraries are not visually set apart from third-party ones.
   - Fix: add a custom `@auaust` group to the perfectionist `sort-imports` configuration, placed between the external and internal (`#…`) groups.

8. Config file lookup through c12's default discovery.
   - Where: `src/config/utils/findConfigFile.ts`, `src/config/utils/importConfigFile.ts`, `src/config/utils/loadConfig.ts`
   - Problem: `findConfigFile` reimplements the lookup of `engrenage.config.*` in the current directory only (no `.config/` directory) and fails on several candidates, while c12 already discovers config files with its own algorithm.
   - Fix: let c12 find the config with its default behaviour and take the project root from c12's result (the directory holding the config, or the parent of `.config/` when the file lives there). Delete `findConfigFile` and update the loadConfig tests that pin the current-directory-only lookup.

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/typescript/utils/syncBarrels.ts`
   - Problem: the callback overload of `filter` from `@auaust/primitive-kit/arrays` returns `T[]` (an array of the input array type) instead of `ToArray<T>`, so filtering a `string[]` is typed `string[][]`.
   - Fix: once primitive-kit returns `ToArray<T>`, replace the native `Array.prototype.filter` call with `filter`.

2. json-schema-to-typescript drops parent properties of requirement-only branches.
   - Where: `src/support/eslint/utils/normalizeRuleSchema.ts`
   - Problem: an object schema with `properties` and `anyOf`/`oneOf` branches holding only `required` compiles to bare `{ [k: string]: unknown }` branches, so rules such as `no-restricted-properties` and `no-restricted-imports` lose their option types. The rule types generator folds the parent schema into each branch to compensate.
   - Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) merges parent properties into such branches, remove `normalizeRuleSchema` and pass the plugins as they are.

3. c12 type-imports its optional peer giget.
   - Where: `env.d.ts`
   - Problem: `c12/dist/index.d.mts` imports `DownloadTemplateOptions` from `giget`, an optional peer engrenage does not install, so type checks with `skipLibCheck: false` (`tsconfig.dist.json`) fail. An ambient `giget` module stands in for it.
   - Fix: once c12 stops type-importing giget from its public types (or engrenage moves to the stable `c12@4`, if fixed there), delete `env.d.ts`.

4. toolkit `compose` cannot type a generic key set.
   - Where: `src/support/accessors/builders/createAccessors.ts`
   - Problem: `compose` and `compose.getters` from `@auaust/toolkit/composer` infer exact property types for concrete keys, but for a generic key set (`Fields extends object`) the composed type stays deferred and is not assignable to the expected mapped type. `createAccessors` therefore ends with `as unknown as Accessors<Fields>`.
   - Fix: report the issue upstream in `@auaust/toolkit` (generic `compose.getters` input should yield a mapped `{ readonly [Key in keyof Getters]: ReturnType<Getters[Key]> }`), then drop the assertion once it is fixed.

## 3. Architecture

1. Compile-time variables in the root config.
   - Where: `src/config/`, `src/tsdown/`, future Vite and Vitest builders
   - Problem: toolkit defines `__NAME__`, `__VERSION__`, `__LICENSE__` and `__TIMESTAMP__` by hand for tsdown and Vitest, with matching ambient declarations in `src/ambient.d.ts`. Engrenage has no shared source for them.
   - Fix: declare compile-time variables as an `engrenage.config.ts` setting, so tsdown, Vite, Vitest and other builders apply the same `define` record. Later, generate the ambient `.d.ts` declarations from it. Settle which fields are standard and whether `__TIMESTAMP__` stays, given it makes builds non-reproducible.

2. Rationalize helpers.
   - Where: `src/utils/`, `src/support/`, each entry's `utils/` and `builders/`
   - Problem: small helpers keep accumulating across entries, with overlapping responsibilities and unclear ownership.
   - Fix: scan the codebase, merge overlapping helpers, move each to its rightful owner, and spot missing abstractions that several helpers work around.
