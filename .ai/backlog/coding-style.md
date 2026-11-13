# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- sites: `scripts/codegen/operations/generateEditions.ts:60`, `:85` (`as Record<string, string | undefined>`), `src/foundation/options/utils/createAccessors.ts:41` (`as unknown as Accessors<Fields>`). ESLint rule casts: `eslint-conventions.1`.
- want: each site typed without the cast or marked with `@debt` stating its invariant.

## 2. Complexity limits sit above their targets

- sites: `eslint.config.ts:5`, `:6`, `src/project/format/constants.ts:19`, `:20`
- why: `functionLines` and `cognitiveComplexity` are disabled for the stylistic rules; the format limits are 20 and 125 against targets of 15 and 100.
- want: functions refactored under the targets, then limits lowered (planning for the refactor scope).

## 3. Repeated types and converters

- sites: `src/project/roles/types/Role.ts:1`, `src/project/tsconfig/utils/toJsonValue.ts:3`
- why: `Role` duplicates the generated `RoleInput`; the JSON-value round trip repeats `serialize` in `defineSchema`.
- want: `RoleInput` used directly; one shared JSON-value converter.

## 4. Canonical JSDoc tag order remains undecided

- want: a small ordered set of common tag groups, stable custom tags, and sorting within each overload only; examples before parameters, returns before throws.
- done: agree on custom-tag placement and overload boundaries before enabling ordering beyond description tags.
