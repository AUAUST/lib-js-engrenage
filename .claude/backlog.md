# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Barrel codegen cannot heal a barrel that names a removed module.
   - Where: `bin/support/codegen/index.ts`, `bin/support/codegen/rules.ts`
   - Problem: the `support` CLI registers every codegen subcommand at startup, and the `rules` subcommand imports the ESLint config builder and with it every conventions barrel. Renaming or deleting a convention module therefore crashes `pnpm support codegen barrels` with `ERR_MODULE_NOT_FOUND` before it can rewrite the stale barrel line, which has to be fixed by hand first.
   - Fix: decouple subcommand registration from their implementations so the barrels command never evaluates the modules it generates; a lazy dynamic import conflicts with the `noDynamicImport` convention, so this needs a deliberate loading pattern for CLI subcommands. Part of AUAUST/lib-js-engrenage#9.

2. Shared project files beyond tool configs.
   - Where: `bin/engrenage/`, `src/config/`
   - Problem: only tool configs (ESLint, Prettier, TypeScript, Vite) and agent instructions are shared. Other files that repeat hard-coded content across AUAUST projects, such as `.gitignore`, `.vscode/settings.json`, `.vscode/extensions.json`, `.editorconfig` and `.gitattributes`, are still copied by hand and drift apart.
   - Fix: add an `engrenage sync` command that builds these files from shared content plus project options in `engrenage.config.ts`, with a `--check` mode for CI. Fold `engrenage agents sync` into it rather than running a parallel mechanism. Not yet scoped as an issue: the file list, config shape and merge policy depend on point 1.3.

3. Classify shareable files by how they can be extended.
   - Where: `data/`, the candidate files listed in point 1.2
   - Problem: some formats have native extension (`extends`, imports, includes) and can consume shared content directly, while others (VS Code settings, `.editorconfig`, `.gitignore`, `.gitattributes`) have none and must be fully generated, merged with project-owned content, or filled through marked blocks like the agent fragments. This is not yet known per file, nor whether project additions survive regeneration.
   - Fix: inventory each candidate file, record whether it extends natively, merges, or is fully rewritten, and decide where project-specific additions live, before designing `engrenage sync`.

4. Canonical `package.json` order.
   - Where: `package.json`, `src/prettier/` or `src/eslint/`
   - Problem: nothing enforces a key order in `package.json`, so manual edits and generated fields (tsdown `exports`, new imports or peer dependencies) land in arbitrary positions.
   - Fix: add a Prettier or ESLint plugin to the shared config that sorts `package.json` in a canonical order.

5. Dedicated `@auaust` import group.
   - Where: `src/eslint/conventions/imports/importOrder.ts`
   - Problem: perfectionist's import order sorts `@auaust/*` packages among the other external imports, so AUAUST libraries are not visually set apart from third-party ones.
   - Fix: add a custom `@auaust` group to the perfectionist `sort-imports` configuration, placed between the external and internal (`#…`) groups. The autofix reorders imports across the repository, so land it as its own change.

6. Config file lookup through c12's default discovery.
   - Where: `src/config/utils/loadConfig.ts` (`findConfigFile`, `importConfigFile`)
   - Problem: `findConfigFile` reimplements the lookup of `engrenage.config.*` in the current directory only (no `.config/` directory) and fails on several candidates, while c12 already discovers config files with its own algorithm.
   - Fix: let c12 find the config with its default behaviour and take the project root from c12's result (the directory holding the config, or the parent of `.config/` when the file lives there). Delete `findConfigFile` and update the loadConfig tests that pin the current-directory-only lookup; settle together with point 4.1.

7. Shared test and build scripts.
   - Where: `package.json` of each AUAUST library
   - Problem: `test`, `build`, `watch` and `coverage` scripts are copied by hand around `defineVitestConfig`, which depends on them passing `--mode build` to test the build output.
   - Fix: decide whether an `engrenage` command checks or syncs them, as `agents sync --check` does, or an agent fragment documents them.

8. Native array methods with a primitive-kit equivalent are not reported.
   - Where: `src/eslint/conventions/globals/`
   - Problem: the code style prefers primitive-kit and toolkit helpers over native methods with an equivalent (`sort(array)` rather than `array.sort()`), but only `Object.*` and `Array.isArray` are enforced, so native calls creep back in and are replaced by hand.
   - Fix: add type-aware conventions reporting native array methods that primitive-kit covers, starting with `sort`, so only arrays are flagged; leave `filter` out until point 2.1 is fixed.

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/config/utils/loadConfig.ts`, `src/typescript/utils/syncBarrels.ts`, `src/typescript/utils/resolvePathAliases.ts`, `src/typescript/utils/createTsconfig.ts`, `src/eslint/utils/syncRuleTypes.ts`, `src/eslint/utils/normalizeRuleSchema.ts`
   - Problem: the callback overload of `filter` from `@auaust/primitive-kit/arrays` returns `T[]` (an array of the input array type) instead of `ToArray<T>`, so filtering a `string[]` is typed `string[][]`.
   - Fix: once primitive-kit returns `ToArray<T>`, replace the native `Array.prototype.filter` calls with `filter`.

2. json-schema-to-typescript drops parent properties of requirement-only branches.
   - Where: `src/eslint/utils/normalizeRuleSchema.ts`
   - Problem: an object schema with `properties` and `anyOf`/`oneOf` branches holding only `required` compiles to bare `{ [k: string]: unknown }` branches, so rules such as `no-restricted-properties` and `no-restricted-imports` lose their option types. The rule types generator folds the parent schema into each branch to compensate.
   - Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) merges parent properties into such branches, remove `normalizeRuleSchema` and pass the plugins as they are.

3. c12 type-imports its optional peer giget.
   - Where: `env.d.ts`
   - Problem: `c12/dist/index.d.mts` imports `DownloadTemplateOptions` from `giget`, an optional peer engrenage does not install, so type checks with `skipLibCheck: false` (`tsconfig.dist.json`) fail. An ambient `giget` module stands in for it.
   - Fix: once c12 stops type-importing giget from its public types (or engrenage moves to the stable `c12@4`, if fixed there), delete `env.d.ts`.

4. toolkit `compose` cannot type a generic key set.
   - Where: `src/config/utils/createAccessors.ts`
   - Problem: `compose` and `compose.getters` from `@auaust/toolkit/composer` infer exact property types for concrete keys, but for a generic key set (`Fields extends object`) the composed type stays deferred and is not assignable to the expected mapped type. `createAccessors` therefore ends with `as unknown as Accessors<Fields>`. `entries` has the same limitation: iterating the generic `resolvers` needs the explicit `entries<Record<string, () => unknown>>`.
   - Fix: report the issue upstream in `@auaust/toolkit` (generic `compose.getters` input should yield a mapped `{ readonly [Key in keyof Getters]: ReturnType<Getters[Key]> }`), then drop the assertion and the explicit type argument once it is fixed.

5. No natural string comparator upstream.
   - Where: `src/typescript/utils/syncBarrels.ts` (`compareNaturally`)
   - Problem: engrenage keeps its own `Intl.Collator` comparator (`numeric: true`, `sensitivity: "base"`) so generated re-exports follow perfectionist's natural order. Neither toolkit nor primitive-kit offers a natural comparator to pass to `sort`/`toSorted`.
   - Fix: add a natural string comparator to primitive-kit `strings` (or toolkit), then sort with it and delete the private `compareNaturally`.

6. No "exactly one element" helper.
   - Where: `src/config/utils/loadConfig.ts` (`findConfigFile`), `src/typescript/utils/resolveImportSpecifier.ts`
   - Problem: both collect candidates, destructure `[first, ...others]` and throw on several (and, for specifiers, on none), each with its own wording.
   - Fix: add a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none), then use it in both places.

7. No "insert a unique key" helper.
   - Where: `src/typescript/utils/resolvePathAliases.ts` (aliases and entry names), `src/tsdown/utils/createTsdownEntries.ts`, `src/eslint/utils/createPlugin.ts`, `src/typescript/utils/syncBarrels.ts` (export names)
   - Problem: five loops look a key up, throw a conflict error, then insert it; the check-then-set sequence is rewritten each time.
   - Fix: add a toolkit helper that sets a key on a record, `Map` or `Set` and throws a caller-described error when the key is taken, then use it in these loops.

8. toolkit `compose` drops the declaration of composed keys.
   - Where: `src/config/utils/createResolvedConfig.ts` (`files` and the returned config), every consumer of `ResolvedConfig` (such as `config.agents` in `src/agents/utils/syncAgentFiles.ts`)
   - Problem: keys passed through `compose.getters` (and likewise `values`, `methods`, `properties`) keep their types but lose the link to the property they were declared on, so go-to-definition on `config.agents`, `config.packageJson` or `config.files.generated` finds nothing and editors render them as plain string keys. Keys of the base object (`config.root`, `config.resolve`) keep their link. The cause is in the composer types of `@auaust/toolkit@0.5.1`: `getterComposers` turns the getters map into a union of `PropertyComposer<Key, …>` (`{ [Key in keyof Getters]-?: … }[keyof Getters][]`), and `ComposedEntry` rebuilds an object from each one with `Record<Name, Descriptor>`. An object built from a union of key literals carries no declarations, whereas a homomorphic mapped type over the original map (`{ [Key in keyof Getters]: … }`) does, and `Extended`, `Simplify` and `DefinedProperties` already preserve them.
   - Fix: report upstream that the plural composers should carry their input map as a whole, for example a `PropertyComposers<Descriptors>` entry typed with `{ [Key in keyof Getters]: { readonly get: Getters[Key] } }`, which `Composed` passes straight to `DefinedProperties` instead of splitting it into one `Record` per key. Checked with the TypeScript language service: `Extended<Base, DefinedProperties<{ [Key in keyof Getters]: { readonly get: Getters[Key] } }>>` resolves both base and getter keys to their declarations. The runtime arrays can stay as they are. Settle together with point 2.4, which touches the same types; once fixed, go-to-definition on `config.agents` should land on `agents` in the `compose.getters` call of `createResolvedConfig`.

## 3. Architecture

1. Compile-time variables in the root config.
   - Where: `src/config/`, `src/tsdown/`, `src/vite/`, `src/vitest/`
   - Problem: toolkit defines `__NAME__`, `__VERSION__`, `__LICENSE__` and `__TIMESTAMP__` by hand for tsdown and Vitest, with matching ambient declarations in `src/ambient.d.ts`. Engrenage has no shared source for them.
   - Fix: declare compile-time variables as an `engrenage.config.ts` setting, so `createTsdownConfig` and `createViteConfig` (which `createVitestConfig` extends) apply the same `define` record. Later, generate the ambient `.d.ts` declarations from it. Settle which fields are standard and whether `__TIMESTAMP__` stays, given it makes builds non-reproducible.

2. Read-only lists under the narrowed alias rule.
   - Where: `src/tsdown/utils/createTsdownEntries.ts`, `src/vite/utils/createViteAliases.ts`, `src/typescript/utils/resolvePathAliases.ts`, `src/typescript/utils/syncBarrels.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/eslint/config/defineEslintConfig.ts`, `src/eslint/utils/`, `src/tsdown/config/schemas/optionsSchema.ts`, `src/eslint/types/Convention.ts` and the convention definers
   - Problem: the TypeScript rule now allows naming read-only lists, which document that a list is never mutated. Engrenage still types list inputs it never mutates as mutable (`PathAlias[]` in `createTsdownEntries` and `createViteAliases`, `barrels` in `syncBarrels`, the native `configs` of `defineTsdownConfig` and `defineEslintConfig`), lets valibot infer mutable arrays for option lists (`bundle`), and repeats `readonly ScopeReference[]` in `Convention` and the three convention definers.
   - Fix: type list inputs as read-only, name the read-only lists that recur (`ScopeReferences`, `PathAliases`), mark schema list outputs read-only with valibot's `readonly()` action, and decide whether returned arrays (`PathAlias[]`, ESLint `Config[]`) stay mutable for consumers that extend them.

3. `createViteAliases` has no consumer left.
   - Where: `src/vite/utils/createViteAliases.ts`, `src/vite/types/Alias.ts`, `src/typescript/types/PathAlias.ts`
   - Problem: Vitest now resolves sources through Vite's `resolve.tsconfigPaths`, so the exported `createViteAliases` and its `Alias` type are no longer used by engrenage, and `PathAlias.alias` only serves them.
   - Fix: decide whether they stay public API; otherwise remove them before the next release and narrow `PathAlias` to what tsdown entries need.

4. tsdown and ESLint native configs cannot be callbacks.
   - Where: `src/tsdown/config/defineTsdownConfig.ts`, `src/eslint/config/defineEslintConfig.ts`
   - Problem: Vite and Vitest native configs accept a callback receiving the native arguments and then the resolved config, while tsdown and ESLint native configs are plain objects, so a native config that depends on resolved values (such as `config.directories.source`) has to go through options or repeat the paths.
   - Fix: accept `(inlineConfig, context, engrenage) => config` for tsdown and `(engrenage) => config` for ESLint native configs, resolved like the options.

5. `package.json` imported through a relative path.
   - Where: `bin/engrenage/index.ts`
   - Problem: the CLI reads its description and version with `import packageJson from "../../package.json"`, the only relative import left, because no subpath import maps `package.json`.
   - Fix: add a `#package.json` subpath import, or read the manifest through `loadConfig` from the package root.

## 4. Edge cases

1. Definers find the project through `process.cwd()`.
   - Where: `src/eslint/config/defineEslintConfig.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/vite/config/defineViteConfig.ts`, `src/vitest/config/defineVitestConfig.ts`
   - Problem: each definer calls `loadConfig()` with the default `process.cwd()`. When a tool runs from another directory than its config file (ESLint 10 looks configs up from the linted file, `vite --config`, Vitest projects, editor integrations), engrenage warns, loads the defaults and roots every path at the wrong directory. The former API took `root: new URL("./", import.meta.url)`.
   - Fix: search upward from the working directory for the nearest `engrenage.config.*` and let definers accept an explicit root for tools that run elsewhere; settle together with point 1.6.

2. Long-lived processes keep the first loaded config.
   - Where: `src/config/utils/loadConfig.ts`
   - Problem: `loadConfig` caches one promise per root for the whole process (only failed loads are retried), and the resolved config memoizes its package.json and tsconfig reads. Vite and Vitest in watch mode or an editor's ESLint server keep the first `engrenage.config.ts` after edits.
   - Fix: decide how long-lived processes refresh the cache, for example by comparing the config file's modification time.

3. An `outDir` outside the project root breaks the resolved config.
   - Where: `src/typescript/utils/createTsconfig.ts`, `src/config/utils/createResolvedConfig.ts`
   - Problem: `outDir` goes through `relativeWithin`, which throws for paths escaping the root even through the `optional` view. A tsconfig emitting outside the package, common in monorepos, makes `files.generated` and with it `createEslintConfig` fail. An `outDir` equal to the root yields the ignore glob `/**`.
   - Fix: decide whether an external `outDir` is supported: if so, keep it absolute and out of the root-relative globs; otherwise fail with a message naming the tsconfig. Reject an `outDir` equal to the root.

4. `files.fixtures` resolves differently per tool.
   - Where: `src/eslint/utils/createIgnoreRules.ts`, `src/vitest/config/createVitestConfig.ts`
   - Problem: ESLint ignores the glob under each test directory only (`tests/**/fixtures/**`), while Vitest excludes it everywhere (`**/fixtures/**`), so fixtures outside the test directories are linted but never tested.
   - Fix: define once whether `files.fixtures` is root-relative or per test directory, and resolve it the same way for both tools.

5. Misspelled block directives pass the check.
   - Where: `src/utils/syncBlocks.ts`
   - Problem: full-line markers with an unknown directive are treated as content. A typo in the first marker (`<!-- @refrence … -->`) leaves its block unfilled while `--check` passes; a typo in a later marker turns it into content of the previous block, which the next sync overwrites. A stray `@end` is ignored the same way.
   - Fix: reject full-line markers whose directive has no filler and an `@end` that closes no block. The `syncBlocks` test that keeps unknown full-line markers as content changes accordingly. Part of AUAUST/lib-js-engrenage#9.

6. Only the root `.gitignore` applies.
   - Where: `src/eslint/utils/createIgnoreRules.ts`
   - Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
   - Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.

7. References resolve with CommonJS conditions.
   - Where: `src/agents/utils/resolveAgentReference.ts`
   - Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
   - Fix: resolve references with ESM conditions. Part of AUAUST/lib-js-engrenage#9.

8. tsdown entries reject path aliases outside the package name.
   - Where: `src/typescript/utils/resolvePathAliases.ts`
   - Problem: entries are named after aliases of the package, so a library whose tsconfig also declares internal aliases (such as `"~/*"`) now fails its build with "is outside the package" instead of the former `Entrypoint conflict for ''`.
   - Fix: decide whether such aliases are skipped, since they can never be public entries, or keep failing so they are noticed.
