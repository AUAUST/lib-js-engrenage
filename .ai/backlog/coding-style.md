# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- sites: `scripts/codegen/operations/generateEditions.ts:60`, `scripts/codegen/operations/generateEditions.ts:85`, `src/foundation/options/utils/createAccessors.ts:41`
- why: `as Record<string, string | undefined>` in `generateEditions`, `as unknown as Accessors<Fields>` in `createAccessors`; ESLint rule casts: `eslint-conventions.1`.
- want: each site typed without the cast or marked with `@debt` stating its invariant.

## 2. Complexity limits sit above their targets

- sites: `eslint.config.ts:5`, `eslint.config.ts:6`, `src/project/format/constants.ts:19`, `src/project/format/constants.ts:20`
- why: `functionLines` and `cognitiveComplexity` are disabled for the stylistic rules; the format limits are 20 and 125 against targets of 15 and 100.
- want: functions refactored under the targets, then limits lowered (planning for the refactor scope).

## 3. Repeated types and converters

- sites: `src/batiment/roles/types/Role.ts:1`, `src/project/tsconfig/utils/toJsonValue.ts:3`
- why: `Role` duplicates the generated `RoleInput`; the JSON-value round trip repeats `serialize` in `defineSchema`.
- want: `RoleInput` used directly; one shared JSON-value converter.

## 4. No convention picks `@throws` or summary prose for a contract's failures

- why: #541's pass split: `foundation` ports and apis use `@throws` (9 sites), every other layer states "Throws…"/"Rejects…" in the summary (~50 sites).
- want: one form in the documentation rule, then the other sites rewritten.

## 5. Oxlint switch losses #557 and #558 do not count

- sites: `src/tools/eslint/conventions/promises/returnAwait.ts:9`, `src/tools/eslint/conventions/stylistic/noRedundantTypes.ts:25`, `src/tools/eslint/conventions/stylistic/noUnnecessaryTypeParameters.ts:154`
- why: on tsgolint these typed delegates lose their filters; 76 of 134 enabled `unicorn` rules lack a native Oxlint rule (1.94.0).
- want: both counted in #557/#558 before planning a switch.
