# vitest

Generated Vitest configuration.

## 1. Test setup files are not included automatically.

- Matter: a `setup.ts` file in a test directory (this repository has `tests/setup.ts`) must be listed in `setupFiles` by hand.
- Expected: when a test directory contains a `setup.ts`, the generated Vitest config includes it in `setupFiles` by default, in `src/vitest/config/createVitestConfig.ts`, overridable through the Vitest options. First check how test directories are resolved from the config (`config.tests`) and how this interacts with the dist/build test mode and per-project setups.
- Done when a `setup.ts` in a test directory is picked up without manual configuration, or obsolete if the option shape rules it out.
