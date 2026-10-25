# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Vite native config loader warning.
   - Where: `vitest.config.ts`
   - Problem: Vite warns that the extensionless `./src/…` imports are unsupported by `configLoader: 'native'`, planned as the future default.
   - Fix: once Vite makes the native loader the default, import the config helpers with explicit extensions or through `#…` subpath imports.

2. Test files outside `tests/`.
   - Where: `config/eslint/`
   - Problem: nothing stops a project from placing test files next to sources, although tests belong under the root `tests/`.
   - Fix: add a shipped ESLint rule that reports files matching the conventional `*.{test,spec}.*` patterns outside `tests/`.

3. Consuming the effective tsconfig.
   - Where: `src/typescript/utils/`
   - Problem: `readCompilerOptions` returns raw compiler options, so each project still adapts them by hand, for example turning `paths` into tsdown entries and checking that `outDir` and `paths` are set in `tsdown.config.ts` and `vitest.config.ts`.
   - Fix: add TypeScript helpers that hand the resolved tsconfig to tools in the shape they expect (such as tsdown entries from `paths`), shared with the `createTsdownConfig` and `createVitestConfig` builders.

## 2. Upstream

1. primitive-kit `filter` return type.
   - Where: `src/typescript/utils/syncBarrels.ts`
   - Problem: the callback overload of `filter` from `@auaust/primitive-kit/arrays` returns `T[]` (an array of the input array type) instead of `ToArray<T>`, so filtering a `string[]` is typed `string[][]`.
   - Fix: once primitive-kit returns `ToArray<T>`, replace the native `Array.prototype.filter` call with `filter`.

2. json-schema-to-typescript drops parent properties of requirement-only branches.
   - Where: `src/support/eslint/utils/normalizeRuleSchema.ts`
   - Problem: an object schema with `properties` and `anyOf`/`oneOf` branches holding only `required` compiles to bare `{ [k: string]: unknown }` branches, so rules such as `no-restricted-properties` and `no-restricted-imports` lose their option types. The rule types generator folds the parent schema into each branch to compensate.
   - Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) merges parent properties into such branches, remove `normalizeRuleSchema` and pass the plugins as they are.
