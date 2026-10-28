# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Native array methods with a primitive-kit equivalent are not reported.
   - Where: `src/eslint/conventions/globals/`
   - Problem: the code style prefers primitive-kit and toolkit helpers over native methods with an equivalent (`sort(array)` rather than `array.sort()`), but only `Object.*` and `Array.isArray` are enforced, so native calls creep back in and are replaced by hand.
   - Fix: add type-aware conventions reporting native array methods that primitive-kit covers, starting with `sort`, so only arrays are flagged; leave `filter` out until point 2.1 is fixed. Gate them on `@auaust/primitive-kit` being a dependency (AUAUST/lib-js-engrenage#11).

2. Existing pnpm workspace files are not synced.
   - Where: `src/pnpm/`, `pnpm-workspace.yaml` of each project
   - Problem: `engrenage init` now offers missing build approvals in existing workspaces, but `engrenage sync` does not maintain workspace settings, and the shared `minimumReleaseAgeExclude` keeps being copied by hand. The pnpm version policy (AUAUST/lib-js-engrenage#15) may add `pmOnFail`.
   - Fix: an `engrenage sync` target that adds missing shared workspace settings while preserving project entries and explicit choices, using the existing `yaml` dependency.

3. Package verification needs registry access in the restricted environment.
   - Where: `pnpm` version selection and the tsdown packaging checks
   - Problem: pnpm cannot verify the selected release because registry fetches fail; the bundle builds, but the full packaging check does not finish. Source and dist tests and type checks pass through the local Node entry points.
   - Fix: rerun the normal build with registry access and a verified pnpm runtime.

4. The lint command overrides `--no-cache`.
   - Where: `bin/engrenage/eslint.ts`, `useCache`
   - Problem: the command appends `--cache` even when `--no-cache` is passed, so cached results can hide changes to local rule implementations.
   - Fix: honor an explicit `--no-cache`; use the ESLint executable directly for uncached verification until then.

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/typescript/utils/syncBarrels.ts`, `src/typescript/utils/resolvePathAliases.ts`, `src/typescript/utils/createTsconfig.ts`, `src/eslint/utils/syncRuleTypes.ts`, `src/eslint/utils/normalizeRuleSchema.ts`, `src/typescript/setup/syncEnvFile.ts`, `tests/eslint/createEslintConfig.test.ts`
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

4. No natural string comparator upstream.
   - Where: `src/typescript/utils/syncBarrels.ts` (`compareNaturally`)
   - Problem: engrenage keeps its own `Intl.Collator` comparator (`numeric: true`, `sensitivity: "base"`) so generated re-exports follow perfectionist's natural order. Neither toolkit nor primitive-kit offers a natural comparator to pass to `sort`/`toSorted`.
   - Fix: add a natural string comparator to primitive-kit `strings` (or toolkit), then sort with it and delete the private `compareNaturally`.

5. No "exactly one element" helper.
   - Where: `src/typescript/utils/resolveImportSpecifier.ts`
   - Problem: it collects candidates, destructures `[first, ...others]` and throws on none or several, a pattern that recurs wherever exactly one match is expected.
   - Fix: add a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none), then use it here.

6. eslint-import-context type-imports type-fest without depending on it.
   - Where: `env.d.ts`
   - Problem: `eslint-import-context/lib/types.d.ts` imports `KebabCase` and `LiteralUnion` from `type-fest`, which it does not declare, so the dist type check (`skipLibCheck: false`) fails once a test reaches a source module that loads `eslint-plugin-import-x` (the VS Code sync now does, through the ESLint config). An ambient `type-fest` module stands in for both types.
   - Fix: once eslint-import-context declares `type-fest` (or import-x stops exposing those types), delete the `type-fest` module from `env.d.ts`.

7. ESLint core rule modules are only reachable through a deprecated export.
   - Where: `src/eslint/utils/findUpstreamRule.ts`, `src/eslint/utils/syncRuleTypes.ts`
   - Problem: `builtinRules` from `eslint/use-at-your-own-risk` is marked deprecated, and `eslint/rules` only ships types, so there is no supported way to load a core rule module to delegate it or generate its types.
   - Fix: move to the supported accessor once ESLint provides one.

8. json-schema-to-typescript duplicates declarations for references with sibling keywords.
   - Where: `src/eslint/utils/normalizeRuleSchema.ts`
   - Problem: a `$ref` carrying a `description` (as in `unicorn/name-replacements`) is compiled as a new schema with the same name, emitting the same interface twice and failing the type check with duplicate index signatures. The rule types generator drops the keywords next to a `$ref`, which JSON Schema draft 4 ignores anyway.
   - Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) deduplicates these declarations, remove the `$ref` normalization.

## 3. Architecture

1. The tsconfig `outDir` can diverge from the configured output directory.
   - Where: `src/config/`, `src/typescript/`
   - Problem: `build.outDir` in `engrenage.config.ts` overrides the tsconfig `compilerOptions.outDir` for tsdown, Vite, Vitest and the ignore files, but the tsconfig keeps its own `outDir`, so `tsc` and editors still see the old one.
   - Fix: add an opt-in `engrenage sync` option that writes the configured output directory into the tsconfig `compilerOptions.outDir` when `build.outDir` is set, and leaves the tsconfig alone otherwise. Decide where the option lives and how it treats an `outDir` inherited through `extends`.

## 4. Edge cases

1. Definers cannot load a project above the working directory.
   - Where: `src/eslint/config/defineEslintConfig.ts`, `src/tsdown/config/defineTsdownConfig.ts`, `src/vite/config/defineViteConfig.ts`, `src/vitest/config/defineVitestConfig.ts`
   - Problem: `loadConfig()` now searches from `process.cwd()` upward to the nearest `package.json`, which covers tools running from a subdirectory of the project. A tool running from above or beside the project (an editor ESLint server opened at a workspace root, `vite --config other/vite.config.ts`, Vitest projects) still roots the config at the wrong directory. The former API took `root: new URL("./", import.meta.url)`.
   - Fix: let definers accept an explicit root. Options can be callbacks receiving the resolved config, so the root cannot live in them: decide where it goes in each definer's signature.

2. Long-lived processes keep the first loaded config.
   - Where: `src/config/utils/loadConfig.ts`, `src/config/utils/createFilesystem.ts`
   - Problem: `loadConfig` caches one promise per root for the whole process (only failed loads are retried), and `config.filesystem` keeps every file it read, so package.json and tsconfig edits are not seen. Vite and Vitest in watch mode or an editor's ESLint server keep the first `engrenage.config.ts` after edits.
   - Fix: decide how long-lived processes refresh the cache, for example by comparing the config file's modification time.

3. Only the root `.gitignore` applies.
   - Where: `src/eslint/utils/createIgnoreRules.ts`
   - Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
   - Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.

4. References resolve with CommonJS conditions.
   - Where: `src/agents/utils/resolveAgentReference.ts`
   - Problem: `createRequire(from).resolve` applies the `require` condition, so a fragment a package exports only under `import` cannot be referenced.
   - Fix: resolve references with ESM conditions. `import.meta.resolve` still ignores its parent argument without `--experimental-import-meta-resolve` (Node 26), so this needs another resolver. Part of AUAUST/lib-js-engrenage#9.

5. The standard `coverage` script needs a coverage provider init does not add.
   - Where: `src/config/setup/createScriptsStep.ts`, `src/vitest/constants.ts`
   - Problem: `engrenage init` adds `coverage: engrenage vitest:coverage` whenever Vitest is a dependency, but the default provider (`@vitest/coverage-istanbul`) is neither a peer dependency of engrenage nor added, so the script fails until it is installed by hand.
   - Fix: decide whether the Vitest step adds the provider (declaring it as an optional peer dependency) or the script is only added once the provider is a dependency.

6. Synced VS Code settings replace whole arrays.
   - Where: `src/vscode/setup/syncVscodeFiles.ts`, `src/support/json/utils/flattenJsonObject.ts`
   - Problem: settings are flattened to one edit per object path, so an array such as `eslint.rules.customizations` is written as a whole and a project's own entries are dropped on every `engrenage sync`.
   - Fix: decide how arrays merge, for example by adding the missing entries keyed by `rule` and keeping the others.
