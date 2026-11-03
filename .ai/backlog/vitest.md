# vitest

Generated Vitest configuration.

## 1. Type-only tests.

- Matter: tests that only type-check (assertions on inferred types, run no code) have no variant of their own; an app already names them `*.types.ts`.
- Context: Vitest's typecheck mode collects `*.test-d.ts` by default; another name needs a custom `typecheck.include`. Test files are matched from location, suffix and extension parts (#155).
- Expected: a type-only test variant built from the same parts, run by Vitest's typecheck mode.
- Done when a project can write type-only tests without configuring Vitest by hand.

## 2. Colocated tests.

- Matter: tests live under one tests root only; some projects keep tests beside their sources.
- Context: the tests environment, its roles and the test variants (#155) assume one root; colocated tests would put test files inside `src` environments, where roles and boundaries (#150) apply.
- Done when colocated tests are supported, or explicitly rejected with a reason.
