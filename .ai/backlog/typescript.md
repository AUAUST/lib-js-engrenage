# typescript

Generated tsconfigs: include globs, managed fields and checks.

## 1. Generated `include` uses brace globs that TypeScript does not expand.

- Where: `src/typescript/setup/produceTsconfigInclude.ts`, default `typescript.files` (`**/*.{ts,tsx}`).
- Problem: `include` patterns like `src/**/*.{ts,tsx}` match no file, because TypeScript supports only `*`, `?` and `**/` in them. A generated environment tsconfig therefore includes nothing, and `engrenage typecheck` passes on a type error. Found while testing #68 (the test sets `typescript.files: "**/*.ts"` to work around it).
- Expected: the generated `include` expands braces, or lists one pattern per extension.
- Done when a project on the default `typescript.files` fails `engrenage typecheck` on a type error in `src/` or `tests/`.

## 2. `engrenage typecheck` throws when no active environment owns a checked tsconfig.

- Where: `bin/engrenage/tsc.ts` (uncommitted work for #69, which made `typecheck:dist` check the `tests.dist` variant).
- Matter: `engrenage typecheck` now throws "No environment is referenced by the base tsconfig: every active environment has `check: false`" when no active environment owns a tsconfig with `check` true. The check runs unconditionally, so a hand-written tsconfig in a project with no active engrenage environments (no `src`, `tests`, etc.) now fails `typecheck`. Issue #69's wording supports the throw, but it is a behavior change.
- Decision: keep it as is, scope it (for example only when at least one environment is active), or document it.
- Done when the decision is taken and the behavior matches it, with a test covering a project without active environments.

## 3. `config.tests.dist.tsconfig.path` falls back to the base tsconfig when the variant file is missing.

- Where: `createResolvedConfig`, whose resolved config vitest also uses; `tsc:dist` in `bin/engrenage/tsc.ts` works around it by checking that the variant file exists.
- Matter: the silent fallback hides a missing `tests.dist` tsconfig and makes consumers guess whether the path is the variant or the base.
- Decision: remove the fallback and fail clearly when the variant file is missing, or keep it as part of the contract and drop the `tsc:dist` workaround.
- Done when the fallback is either gone or documented as intended, and `tsc:dist` no longer carries its own existence check unless the contract needs it.

## 4. Init steps write tsconfig fields that sync removes or that no longer exist.

- Where: `src/typescript/setup/createTsconfigStep.ts`, `src/typescript/setup/createDistTsconfigStep.ts`.
- Matter: `createTsconfigStep` writes the baseline (`tsconfig/baseline/<version>.json`) into `extends`, which `engrenage sync` then removes (`produceTsconfigExtends` only produces the library or base file). `createDistTsconfigStep` still extends `tsconfig/library.dist.json`, which the new layout no longer uses.
- Expected: the init steps write only what the sync producers keep, so init followed by sync is a no-op.
- Done when init followed by `engrenage sync --check` reports no drift on the generated tsconfigs.

## 5. This repository's own tsconfigs still drift from the sync producers.

- Matter: `pnpm engrenage sync --check` reports drift in this repository's tsconfigs. The repository has not adopted the new tsconfig layout yet, and the other producers (target, lib, types, base references) belong to the other sub-issues of the layout work.
- Done when this repository adopts the new layout and `sync --check` passes, or the producers' sub-issues settle what remains.

## 6. `data/apis` declarations are written by hand.

- Where: `data/apis/timers.d.ts`, `data/apis/crypto.d.ts`, `data/apis/performance.d.ts`.
- Problem: API interfaces must never be hand-written. `timers.d.ts` declares `setTimeout` but not `setInterval`, so the first manual interface is already wrong.
- Expected: every declaration in `data/apis` is generated from a source of truth, imported from an existing library, or otherwise derived automatically.
- Done when no hand-written API specs remain in `data/apis`.
