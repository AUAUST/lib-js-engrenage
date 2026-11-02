# typescript

Generated tsconfigs: checks, variant resolution and shipped type declarations.

## 1. `engrenage typecheck` throws when no active environment owns a checked tsconfig.

- Where: `hasReferencedEnvironment` in `bin/engrenage/tsc.ts`, added with #69.
- Matter: `engrenage typecheck` now throws "No environment is referenced by the base tsconfig: every active environment has `check: false`" when no active environment owns a tsconfig with `check` true. The check runs unconditionally, so a hand-written tsconfig in a project with no active engrenage environments (no `src`, `tests`, etc.) now fails `typecheck`. Issue #69's wording supports the throw, but it is a behavior change.
- Decision: keep it as is, scope it (for example only when at least one environment is active), or document it.
- Done when the decision is taken and the behavior matches it, with a test covering a project without active environments.

## 2. `config.tests.dist.tsconfig.path` falls back to the base tsconfig when the variant file is missing.

- Where: `environmentTsconfigFor` in `src/config/utils/createResolvedConfig.ts` (`tests.dist` path falls back to `tsconfigPath()`), read by `createVitestConfig` in build mode and asserted by `tests/config/loadConfig.test.ts`; `tsc:dist` in `bin/engrenage/tsc.ts` works around it by reading `file` and checking that it exists.
- Matter: the silent fallback hides a missing `tests.dist` tsconfig and makes consumers guess whether the path is the variant or the base.
- Decision: remove the fallback and fail clearly when the variant file is missing, or keep it as part of the contract and drop the `tsc:dist` workaround.
- Done when the fallback is either gone or documented as intended, and `tsc:dist` no longer carries its own existence check unless the contract needs it.

## 3. `data/apis` declarations are written by hand.

- Where: `data/apis/timers.d.ts`, `data/apis/crypto.d.ts`, `data/apis/performance.d.ts`.
- Problem: API interfaces must never be hand-written. `timers.d.ts` declares `setTimeout` but not `setInterval`, so the first manual interface is already wrong.
- Expected: every declaration in `data/apis` is generated from a source of truth, imported from an existing library, or otherwise derived automatically.
- Related: #96 (hand-maintained `data/tsconfig` runtime presets).
- Done when no hand-written API specs remain in `data/apis`.
