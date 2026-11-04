# primitive-kit

Upstream @auaust/primitive-kit types and missing helpers.

## 1. The callback overload of primitive-kit `filter` returns `T[]` instead of `ToArray<T>`.

- why: filtering a `string[]` with `filter` from `@auaust/primitive-kit/arrays` is typed `string[][]`, so the native `Array.prototype.filter` stays in `src/tools/typescript/operations/syncBarrels.ts`, `src/project/tsconfig/operations/resolvePathAliases.ts`, `src/project/tsconfig/operations/createTsconfig.ts`, `src/tools/eslint/operations/generateRuleTypes.ts`, `src/tools/eslint/utils/normalizeRuleSchema.ts`, `src/tools/typescript/setup/syncEnvFile.ts`, `tests/eslint/createEslintConfig.test.ts`.
- want: primitive-kit returns `ToArray<T>`; those calls move to `filter`.

## 2. No natural string comparator exists upstream.

- why: engrenage keeps its own `compareNaturally` in `src/tools/typescript/operations/syncBarrels.ts`, an `Intl.Collator` comparator (`numeric: true`, `sensitivity: "base"`) so generated re-exports follow perfectionist's natural order. Neither toolkit nor primitive-kit offers one to pass to `sort`/`toSorted`.
- want: a natural string comparator in primitive-kit `strings` (or toolkit); sort with it and delete the private `compareNaturally`.

## 3. No "exactly one element" helper exists.

- why: `src/tools/typescript/utils/resolveImportSpecifier.ts` collects candidates, destructures `[first, ...others]` and throws on none or several, a pattern that recurs wherever exactly one match is expected.
- want: a primitive-kit `arrays` helper returning the only element and failing with a described error on several (optionally on none); use it here.
