# vitest

Generated Vitest configuration.

## 1. Type-only tests have no variant of their own.

- why: tests that only type-check (assertions on inferred types, run no code) are named `*.types.ts` in an app, while Vitest's typecheck mode collects `*.test-d.ts` by default and another name needs a custom `typecheck.include`. Test files are matched from location, suffix and extension parts (#155).
- want: a type-only test variant built from the same parts, run by Vitest's typecheck mode.
- done: a project can write type-only tests without configuring Vitest by hand.

## 2. Tests cannot be colocated with their sources.

- why: tests live under one tests root only; some projects keep tests beside their sources. The tests environment, its roles and the test variants (#155) assume one root; colocated tests would put test files inside `src` environments, where roles and boundaries (#150) apply.
- done: colocated tests are supported, or explicitly rejected with a reason.

## 3. `executable.test.ts` failed once in a full run.

- why: seen during #141, passing on reruns; possibly flaky (spawned process timing).
- done: cause found, or no recurrence after several full runs.

## 4. Vitest options replace or hide defaults

- sites: `src/tools/vitest/config/schemas/optionsSchema.ts:4` (shared workers break `vi.mock` for consumers: the first file run fixes the module graph), `:7` (`guardOutDir` switches a built-in plugin by flag, not name), `:9` (`setupFiles` replaces the discovered ones), `src/tools/vitest/operations/createVitestConfig.ts:94` (`include` replaces the default, so `.js`/`.mjs` tests are no longer collected).
- want: a decision on the shared-workers default (decision); the rest is direct implementation.

## 5. The test suite silences every warning and leaves build hooks untested

- sites: `tests/setup.ts:6` (all warnings silenced), `src/project/build/operations/createEmittedManifest.ts:27` (its tsdown and Vite plugin hooks untested; no test runs a real build with `clean: "emitted"`).
- want: warnings go through a logger tests silence only for expected ones; a real-build test.
