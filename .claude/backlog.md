# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Barrel codegen cannot heal a barrel that names a removed module.
   - Where: `bin/support/codegen/index.ts`, `bin/support/codegen/rules.ts`
   - Problem: the `support` CLI registers every codegen subcommand at startup, and the `rules` subcommand imports the ESLint config builder and with it every conventions barrel. Renaming or deleting a convention module therefore crashes `pnpm support codegen barrels` with `ERR_MODULE_NOT_FOUND` before it can rewrite the stale barrel line, which has to be fixed by hand first.
   - Fix: decouple subcommand registration from their implementations so the barrels command never evaluates the modules it generates; a lazy dynamic import conflicts with the `noDynamicImport` convention, so this needs a deliberate loading pattern for CLI subcommands. Part of AUAUST/lib-js-engrenage#9.

2. Native array methods with a primitive-kit equivalent are not reported.
   - Where: `src/eslint/conventions/globals/`
   - Problem: the code style prefers primitive-kit and toolkit helpers over native methods with an equivalent (`sort(array)` rather than `array.sort()`), but only `Object.*` and `Array.isArray` are enforced, so native calls creep back in and are replaced by hand.
   - Fix: add type-aware conventions reporting native array methods that primitive-kit covers, starting with `sort`, so only arrays are flagged; leave `filter` out until point 2.1 is fixed. Gate them on `@auaust/primitive-kit` being a dependency (AUAUST/lib-js-engrenage#11).

3. pnpm workspace defaults are copied by hand.
   - Where: `pnpm-workspace.yaml` of each project
   - Problem: `minimumReleaseAgeExclude: ["@auaust/*"]` and the shared `allowBuilds` entries repeat in every project, and the pnpm version policy (AUAUST/lib-js-engrenage#15) may add `pmOnFail`.
   - Fix: an `engrenage sync` target (AUAUST/lib-js-engrenage#12) that writes the shared keys and keeps project `allowBuilds` entries. Editing YAML in place needs a parser that preserves the file (dependency to approve).

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/typescript/utils/syncBarrels.ts`, `src/typescript/utils/resolvePathAliases.ts`, `src/typescript/utils/createTsconfig.ts`, `src/eslint/utils/syncRuleTypes.ts`, `src/eslint/utils/normalizeRuleSchema.ts`
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
   - Where: `src/typescript/utils/resolveImportSpecifier.ts`
   - Problem: it collects candidates, destructures `[first, ...others]` and throws on none or several, a pattern that recurs wherever exactly one match is expected.
   - Fix: add a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none), then use it here.

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

## 4. Edge cases

1. Definers cannot load a project above the working directory.
   - Where: `src/eslint/config/defineEslintConfig.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/vite/config/defineViteConfig.ts`, `src/vitest/config/defineVitestConfig.ts`
   - Problem: `loadConfig()` now searches from `process.cwd()` upward to the nearest `package.json`, which covers tools running from a subdirectory of the project. A tool running from above or beside the project (an editor ESLint server opened at a workspace root, `vite --config other/vite.config.ts`, Vitest projects) still roots the config at the wrong directory. The former API took `root: new URL("./", import.meta.url)`.
   - Fix: let definers accept an explicit root. Options can be callbacks receiving the resolved config, so the root cannot live in them: decide where it goes in each definer's signature.

2. Long-lived processes keep the first loaded config.
   - Where: `src/config/utils/loadConfig.ts`
   - Problem: `loadConfig` caches one promise per root for the whole process (only failed loads are retried), and the resolved config memoizes its package.json and tsconfig reads. Vite and Vitest in watch mode or an editor's ESLint server keep the first `engrenage.config.ts` after edits.
   - Fix: decide how long-lived processes refresh the cache, for example by comparing the config file's modification time.

3. Misspelled block directives pass the check.
   - Where: `src/utils/syncBlocks.ts`
   - Problem: full-line markers with an unknown directive are treated as content. A typo in the first marker (`<!-- @refrence … -->`) leaves its block unfilled while `--check` passes; a typo in a later marker turns it into content of the previous block, which the next sync overwrites. A stray `@end` is ignored the same way.
   - Fix: reject full-line markers whose directive has no filler and an `@end` that closes no block. The `syncBlocks` test that keeps unknown full-line markers as content changes accordingly. Part of AUAUST/lib-js-engrenage#9.

4. Only the root `.gitignore` applies.
   - Where: `src/eslint/utils/createIgnoreRules.ts`
   - Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
   - Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.

5. References resolve with CommonJS conditions.
   - Where: `src/agents/utils/resolveAgentReference.ts`
   - Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
   - Fix: resolve references with ESM conditions. Part of AUAUST/lib-js-engrenage#9.
