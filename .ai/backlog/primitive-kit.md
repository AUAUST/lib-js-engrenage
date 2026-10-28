# primitive-kit

Upstream @auaust/primitive-kit types and missing helpers.

## 1. primitive-kit `filter` return type.

- Where: `src/typescript/utils/syncBarrels.ts`, `src/typescript/utils/resolvePathAliases.ts`, `src/typescript/utils/createTsconfig.ts`, `src/eslint/utils/syncRuleTypes.ts`, `src/eslint/utils/normalizeRuleSchema.ts`, `src/typescript/setup/syncEnvFile.ts`, `tests/eslint/createEslintConfig.test.ts`
- Problem: the callback overload of `filter` from `@auaust/primitive-kit/arrays` returns `T[]` (an array of the input array type) instead of `ToArray<T>`, so filtering a `string[]` is typed `string[][]`.
- Fix: once primitive-kit returns `ToArray<T>`, replace the native `Array.prototype.filter` calls with `filter`.

## 2. No natural string comparator upstream.

- Where: `src/typescript/utils/syncBarrels.ts` (`compareNaturally`)
- Problem: engrenage keeps its own `Intl.Collator` comparator (`numeric: true`, `sensitivity: "base"`) so generated re-exports follow perfectionist's natural order. Neither toolkit nor primitive-kit offers a natural comparator to pass to `sort`/`toSorted`.
- Fix: add a natural string comparator to primitive-kit `strings` (or toolkit), then sort with it and delete the private `compareNaturally`.

## 3. No "exactly one element" helper.

- Where: `src/typescript/utils/resolveImportSpecifier.ts`
- Problem: it collects candidates, destructures `[first, ...others]` and throws on none or several, a pattern that recurs wherever exactly one match is expected.
- Fix: add a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none), then use it here.
