# vitest

Generated Vitest configuration.

## 1. Type-only tests have no variant of their own.

- why: tests that only type-check (assertions on inferred types, run no code) are named `*.types.ts` in an app, while Vitest's typecheck mode collects `*.test-d.ts` by default and another name needs a custom `typecheck.include`. Test files are matched from location, suffix and extension parts (#155).
- want: a type-only test variant built from the same parts, run by Vitest's typecheck mode.
- done: a project can write type-only tests without configuring Vitest by hand.

## 2. Tests cannot be colocated with their sources.

- why: tests live under one tests root only; some projects keep tests beside their sources. The tests environment, its roles and the test variants (#155) assume one root; colocated tests would put test files inside `src` environments, where roles and boundaries (#150) apply.
- done: colocated tests are supported, or explicitly rejected with a reason.

## 3. Vitest options and config defaults surprise consumers

- sites: `src/tools/vitest/config/schemas/optionsSchema.ts:4`, `:7`, `:9`, `src/tools/vitest/operations/createVitestConfig.ts:77`
- why: shared workers by default break `vi.mock` across tests loading the same modules; `guardOutDir` switches a plugin by flag, not name (as `defineTsdownConfig` does); `setupFiles` replaces discovered setup files; `include` drops `.js`/`.mjs` tests.
- want: an isolating worker default (planning); plugins by name; setup files and `include` extending defaults.
