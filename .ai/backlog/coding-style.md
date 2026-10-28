# coding-style

Coding style conventions, ESLint behavior and linting gaps.

## 1. Native array methods with a primitive-kit equivalent are not reported.

- Where: `src/eslint/conventions/globals/`
- Problem: the code style prefers primitive-kit and toolkit helpers over native methods with an equivalent (`sort(array)` rather than `array.sort()`), but only `Object.*` and `Array.isArray` are enforced, so native calls creep back in and are replaced by hand.
- Fix: add type-aware conventions reporting native array methods that primitive-kit covers, starting with `sort`, so only arrays are flagged; leave `filter` out until the `filter` typing issue in [primitive-kit.1](primitive-kit.md#1-primitive-kit-filter-return-type) is fixed. Gate them on `@auaust/primitive-kit` being a dependency (AUAUST/lib-js-engrenage#11).

## 2. The lint command overrides `--no-cache`.

- Where: `bin/engrenage/eslint.ts`, `useCache`
- Problem: the command appends `--cache` even when `--no-cache` is passed, so cached results can hide changes to local rule implementations.
- Fix: honor an explicit `--no-cache`; use the ESLint executable directly for uncached verification until then.

## 3. Only the root `.gitignore` applies.

- Where: `src/eslint/utils/createIgnoreRules.ts`
- Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
- Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.
