# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Vite native config loader warning.
   - Where: `vitest.config.ts`
   - Problem: Vite warns that the extensionless `./src/…` imports are unsupported by `configLoader: 'native'`, planned as the future default.
   - Fix: once Vite makes the native loader the default, import the config helpers with explicit extensions or through `#…` subpath imports.

2. Barrel codegen cannot heal a barrel that names a removed module.
   - Where: `bin/support/codegen/index.ts`, `bin/support/codegen/rules.ts`
   - Problem: the `support` CLI registers every codegen subcommand at startup, and the `rules` subcommand imports the ESLint config builder and with it every conventions barrel. Renaming or deleting a convention module therefore crashes `pnpm support codegen barrels` with `ERR_MODULE_NOT_FOUND` before it can rewrite the stale barrel line, which has to be fixed by hand first.
   - Fix: decouple subcommand registration from their implementations so the barrels command never evaluates the modules it generates; a lazy dynamic import conflicts with the `noDynamicImport` convention, so this needs a deliberate loading pattern for CLI subcommands.

3. Shared project files beyond tool configs.
   - Where: `bin/engrenage/`, `src/config/`
   - Problem: only tool configs (ESLint, Prettier, TypeScript, Vite) and agent instructions are shared. Other files that repeat hard-coded content across AUAUST projects, such as `.gitignore`, `.vscode/settings.json`, `.vscode/extensions.json`, `.editorconfig` and `.gitattributes`, are still copied by hand and drift apart.
   - Fix: add an `engrenage sync` command that builds these files from shared content plus project options in `engrenage.config.ts`, with a `--check` mode for CI. Fold `engrenage agents sync` into it rather than running a parallel mechanism. Not yet scoped as an issue: the file list, config shape and merge policy depend on point 1.4.

4. Classify shareable files by how they can be extended.
   - Where: `data/`, the candidate files listed in point 1.3
   - Problem: some formats have native extension (`extends`, imports, includes) and can consume shared content directly, while others (VS Code settings, `.editorconfig`, `.gitignore`, `.gitattributes`) have none and must be fully generated, merged with project-owned content, or filled through marked blocks like the agent fragments. This is not yet known per file, nor whether project additions survive regeneration.
   - Fix: inventory each candidate file, record whether it extends natively, merges, or is fully rewritten, and decide where project-specific additions live, before designing `engrenage sync`.

5. Canonical `package.json` order.
   - Where: `package.json`, `src/prettier/` or `src/eslint/`
   - Problem: nothing enforces a key order in `package.json`, so manual edits and generated fields (tsdown `exports`, new imports or peer dependencies) land in arbitrary positions.
   - Fix: add a Prettier or ESLint plugin to the shared config that sorts `package.json` in a canonical order.

6. Dedicated `@auaust` import group.
   - Where: `src/eslint/conventions/imports/importOrder.ts`
   - Problem: perfectionist's import order sorts `@auaust/*` packages among the other external imports, so AUAUST libraries are not visually set apart from third-party ones.
   - Fix: add a custom `@auaust` group to the perfectionist `sort-imports` configuration, placed between the external and internal (`#…`) groups.

7. Config file lookup through c12's default discovery.
   - Where: `src/config/utils/findConfigFile.ts`, `src/config/utils/importConfigFile.ts`, `src/config/utils/loadConfig.ts`
   - Problem: `findConfigFile` reimplements the lookup of `engrenage.config.*` in the current directory only (no `.config/` directory) and fails on several candidates, while c12 already discovers config files with its own algorithm.
   - Fix: let c12 find the config with its default behaviour and take the project root from c12's result (the directory holding the config, or the parent of `.config/` when the file lives there). Delete `findConfigFile` and update the loadConfig tests that pin the current-directory-only lookup.

8. Shared test and build scripts.
   - Where: `package.json` of each AUAUST library
   - Problem: `test`, `build`, `watch` and `coverage` scripts are copied by hand around `defineVitestConfig`, which depends on them passing `--mode build` to test the build output.
   - Fix: decide whether an `engrenage` command checks or syncs them, as `agents sync --check` does, or an agent fragment documents them.

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/typescript/utils/syncBarrels.ts`, `src/config/utils/findConfigFile.ts`, `src/support/eslint/utils/syncRuleTypes.ts`, `src/support/eslint/utils/normalizeRuleSchema.ts`
   - Problem: the callback overload of `filter` from `@auaust/primitive-kit/arrays` returns `T[]` (an array of the input array type) instead of `ToArray<T>`, so filtering a `string[]` is typed `string[][]`.
   - Fix: once primitive-kit returns `ToArray<T>`, replace the native `Array.prototype.filter` calls with `filter`.

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
   - Problem: `compose` and `compose.getters` from `@auaust/toolkit/composer` infer exact property types for concrete keys, but for a generic key set (`Fields extends object`) the composed type stays deferred and is not assignable to the expected mapped type. `createAccessors` therefore ends with `as unknown as Accessors<Fields>`. `entries` has the same limitation: iterating the generic `resolvers` needs the explicit `entries<Record<string, () => unknown>>`.
   - Fix: report the issue upstream in `@auaust/toolkit` (generic `compose.getters` input should yield a mapped `{ readonly [Key in keyof Getters]: ReturnType<Getters[Key]> }`), then drop the assertion and the explicit type argument once it is fixed.

5. No natural string comparator upstream.
   - Where: `src/utils/compareNaturally.ts`
   - Problem: engrenage keeps its own `Intl.Collator` comparator (`numeric: true`, `sensitivity: "base"`) so generated re-exports follow perfectionist's natural order. Neither toolkit nor primitive-kit offers a natural comparator to pass to `sort`/`toSorted`.
   - Fix: add a natural string comparator to primitive-kit `strings` (or toolkit), then sort with it and delete `compareNaturally`.

6. No "exactly one element" helper.
   - Where: `src/config/utils/findConfigFile.ts`, `src/typescript/utils/resolveImportSpecifier.ts`
   - Problem: both collect candidates, destructure `[first, ...others]` and throw on several (and, for specifiers, on none), each with its own wording.
   - Fix: add a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none), then use it in both places.

7. No "insert a unique key" helper.
   - Where: `src/typescript/utils/resolvePathAliases.ts` (aliases and entry names), `src/tsdown/builders/createTsdownEntries.ts`, `src/eslint/builders/createPlugin.ts`
   - Problem: four loops look a key up, throw a conflict error naming both values, then insert it; the check-then-set sequence is rewritten each time.
   - Fix: add a toolkit helper that sets a key on a record or `Map` and throws a caller-described error when the key is taken, then use it in the four loops.

8. toolkit `once` only wraps argument-less callbacks.
   - Where: `src/config/utils/warnMissingConfig.ts`
   - Problem: `once` accepts `Callee<any, readonly []>`, so warning once with the first root in the message keeps a hand-written module-level `hasWarned` flag.
   - Fix: let `once` forward arguments (the first call wins, later calls return its result), then build `warnMissingConfig` with it.

## 3. Architecture

1. Compile-time variables in the root config.
   - Where: `src/config/`, `src/tsdown/`, `src/vite/`, `src/vitest/`
   - Problem: toolkit defines `__NAME__`, `__VERSION__`, `__LICENSE__` and `__TIMESTAMP__` by hand for tsdown and Vitest, with matching ambient declarations in `src/ambient.d.ts`. Engrenage has no shared source for them.
   - Fix: declare compile-time variables as an `engrenage.config.ts` setting, so `createTsdownConfig` and `createViteConfig` (which `createVitestConfig` extends) apply the same `define` record. Later, generate the ambient `.d.ts` declarations from it. Settle which fields are standard and whether `__TIMESTAMP__` stays, given it makes builds non-reproducible.

2. Rationalize helpers.
   - Where: `src/utils/`, `src/support/`, each entry's `utils/` and `builders/`
   - Problem: small helpers keep accumulating across entries, with overlapping responsibilities and unclear ownership.
   - Fix: scan the codebase, merge overlapping helpers, move each to its rightful owner, and spot missing abstractions that several helpers work around.

3. Barrel discovery ignores the configured source directories.
   - Where: `src/typescript/constants.ts` (`barrelFiles`), `src/typescript/utils/syncBarrels.ts`
   - Problem: barrels are found with the hard-coded `src/**/index.ts` instead of `config.directories.source`, and selected by directory basename, so barrels in two directories with the same name cannot be told apart.
   - Fix: derive the barrel globs from `directories.source`, and select barrels by root-relative directory, accepting the basename only when it is unambiguous.

## 4. Edge cases

1. Definers find the project through `process.cwd()`.
   - Where: `src/eslint/config/defineEslintConfig.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/vite/config/defineViteConfig.ts`, `src/vitest/config/defineVitestConfig.ts`
   - Problem: each definer calls `loadConfig()` with the default `process.cwd()`. When a tool runs from another directory than its config file (ESLint 10 looks configs up from the linted file, `vite --config`, Vitest projects, editor integrations), engrenage warns, loads the defaults and roots every path at the wrong directory. The former API took `root: new URL("./", import.meta.url)`.
   - Fix: search upward from the working directory for the nearest `engrenage.config.*` and let definers accept an explicit root for tools that run elsewhere; settle together with point 1.7.

2. Long-lived processes keep the first loaded config.
   - Where: `src/config/utils/loadConfig.ts`
   - Problem: `loadConfig` caches one promise per root for the whole process, rejected ones included, and the resolved config memoizes its package.json and tsconfig reads. Vite and Vitest in watch mode or an editor's ESLint server keep the first `engrenage.config.ts` after edits, and a load that failed once keeps failing until restart.
   - Fix: evict rejected loads, and decide how long-lived processes refresh the cache (for example by comparing the config file's modification time).

3. Path aliases assume package-style names with one wildcard.
   - Where: `src/typescript/utils/resolvePathAliases.ts`, `src/vitest/builders/createVitestConfig.ts`
   - Problem: `resolvePathAliases` derives tsdown entry names for every alias, even for Vitest, which only needs alias to file. Aliases that do not start with the package name get empty names, so an app-style `"@/*": ["./src/*"]` fails with `Entrypoint conflict for ''` and the Vitest config cannot load. It also assumes one `*` on each side: a wildcard alias with an exact target yields the alias `my-app/`, and a `src/*` target matches directories. `createSourceAliases` requires `packageJson.name` although aliases do not use it, and wildcards are expanded by globbing at config time, so files created during a watch session get no alias.
   - Fix: split alias resolution (alias to file, used by Vite) from entry naming (owned by `createTsdownEntries`), reject patterns without exactly one `*` per side, glob files only, and map wildcard aliases to a capturing regular expression instead of expanding them.

4. `parseTsconfig` fails on a tsconfig without inputs.
   - Where: `src/support/tsconfig/utils/parseTsconfig.ts`
   - Problem: TypeScript reports TS18003 ("No inputs were found") as a parse error and `parseTsconfig` throws on every error, so a project whose tsconfig matches no file yet cannot read `outDir` or `paths`, although engrenage only needs the compiler options.
   - Fix: ignore TS18003 when reading compiler options.

5. Subpath imports resolve string targets only.
   - Where: `src/typescript/utils/resolveImportSpecifier.ts`
   - Problem: conditional targets (`{ "types": …, "default": … }`) and targets with several `*` are skipped silently, so the barrels codegen fails with `found 0` for a file a valid `imports` entry covers.
   - Fix: resolve conditional targets through their `default` condition and reject patterns with several `*` explicitly.

6. The Vitest out-dir guard misses symlinked projects.
   - Where: `src/vitest/builders/createOutDirGuard.ts`, `src/support/filesystem/utils/isWithin.ts`
   - Problem: Vite resolves ids to real paths, while the guard compares them with an `outDir` resolved from the unresolved root. When the project path goes through a symlink, imports of the package that resolve into the build output pass silently (reproduced with a symlink to `tests/fixtures/vitest`).
   - Fix: compare real paths, by resolving `outDir` with `realpathSync` or the root with `realpath` in `loadConfig`.

7. An `outDir` outside the project root breaks the resolved config.
   - Where: `src/support/tsconfig/utils/createTsconfig.ts`, `src/config/utils/createResolvedConfig.ts`
   - Problem: `outDir` goes through `relativeWithin`, which throws for paths escaping the root even through the `optional` view. A tsconfig emitting outside the package, common in monorepos, makes `files.generated` and with it `createEslintConfig` fail. An `outDir` equal to the root yields the ignore glob `/**`.
   - Fix: decide whether an external `outDir` is supported: if so, keep it absolute and out of the root-relative globs; otherwise fail with a message naming the tsconfig. Reject an `outDir` equal to the root.

8. `files.fixtures` resolves differently per tool.
   - Where: `src/eslint/builders/createIgnoreRules.ts`, `src/vitest/builders/createVitestConfig.ts`
   - Problem: ESLint ignores the glob under each test directory only (`tests/**/fixtures/**`), while Vitest excludes it everywhere (`**/fixtures/**`), so fixtures outside the test directories are linted but never tested.
   - Fix: define once whether `files.fixtures` is root-relative or per test directory, and resolve it the same way for both tools.

9. Misspelled block directives pass the check.
   - Where: `src/utils/syncBlocks.ts`
   - Problem: full-line markers with an unknown directive are treated as content. A typo in the first marker (`<!-- @refrence … -->`) leaves its block unfilled while `--check` passes; a typo in a later marker turns it into content of the previous block, which the next sync overwrites. A stray `@end` is ignored the same way.
   - Fix: reject full-line markers whose directive has no filler and an `@end` that closes no block. The `syncBlocks` test that keeps unknown full-line markers as content changes accordingly.

10. Only the root `.gitignore` applies.
    - Where: `src/eslint/builders/createIgnoreRules.ts`
    - Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
    - Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.

11. Barrel blocks do not validate the modules they list.
    - Where: `src/typescript/utils/syncBarrels.ts`
    - Problem: `@reference` re-exports every `*.ts` of the directory, its `index.ts`, declaration and test files included, while `@registry` skips the barrel itself. Registry names come from file basenames unchecked: a kebab-case file produces invalid code, and equal basenames from a recursive glob produce duplicate exports.
    - Fix: share one module filter between both directives (skipping the barrel, declarations and tests), and fail on basenames that are not identifiers or that collide.

12. Glob results keep platform separators.
    - Where: `src/support/eslint/utils/syncRuleTypes.ts`, `src/typescript/utils/syncBarrels.ts`, `src/agents/utils/syncAgentFiles.ts`
    - Problem: `globSync` returns `\`-separated paths on Windows. `syncRuleTypes` compares them with POSIX keys, so every rule module would be reported stale and deleted after being written; the reported file lists also mix separators.
    - Fix: pass glob results through `toPosixPath`.

13. References resolve with CommonJS conditions.
    - Where: `src/utils/resolveReference.ts`
    - Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
    - Fix: resolve references with ESM conditions.
