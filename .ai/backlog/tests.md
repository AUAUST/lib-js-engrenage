# tests

Test infrastructure and coverage gaps.

## 1. Test infrastructure gaps

- sites: `src/project/build/operations/createEmittedManifest.ts:25`, `tests/scripts/codegen/generateApiDeclarations.test.src.ts:24`, `tests/setup.ts:15`, `tests/bin/engrenage/structure.test.src.ts:36`, `tests/src/project/config/resolveListOption.test.src.ts:1`, `tests/utils/binaryTimeout.ts:1`
- why: tsdown and Vite hooks untested, no real build with `clean: "emitted"`; a bare timeout beside `binaryTimeout`; every warning silenced; structure output untested; `foundation/options` tested from `project/config`'s mirror; a comment below `binaryTimeout` explains instead of naming.
- want: a build-level test; one named timeout scale; an owned logger so tests silence only expected warnings; structure test on its report; options test in its mirror; a name carrying the explanation.

## 2. Test setup reaches the package through workarounds

- sites: `tests/src/tools/eslint/roleRules.test.ts:43`, `tests/tooling/eslint/rules.test.src.ts:21`, `tests/utils/linkSourcePackage.ts:30`, `tests/src/foundation/blocks/syncBlocks.test.src.ts:5`
- why: temporary configs cannot import `@auaust/engrenage` or the tooling, so rules cross through `globalThis`; every root entry is linked; a source-only test exists because generated paths resolve `agents/constants` to the index.
- want: test configs resolve package and tooling; the link limited to published and source-mode entries; the block test through the public entry.

## 3. Process-spawning tests time out under the worktree gate's load

- why: `engrenage gate --worktree` failed 3 of 5 runs on different spawn-based tests (`runGateLocks` lock release, `hookFailures` 5000 ms timeout), each passing alone and in `pnpm test`.
- want: these tests scale their timeouts with `binaryTimeout`, or the gate runs them without competing load.
