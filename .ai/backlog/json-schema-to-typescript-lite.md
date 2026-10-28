# json-schema-to-typescript-lite

Upstream schema compilation issues reached through eslint-typegen.

## 1. json-schema-to-typescript drops parent properties of requirement-only branches.

- Where: `src/eslint/utils/normalizeRuleSchema.ts`
- Problem: an object schema with `properties` and `anyOf`/`oneOf` branches holding only `required` compiles to bare `{ [k: string]: unknown }` branches, so rules such as `no-restricted-properties` and `no-restricted-imports` lose their option types. The rule types generator folds the parent schema into each branch to compensate.
- Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) merges parent properties into such branches, remove `normalizeRuleSchema` and pass the plugins as they are.

## 2. json-schema-to-typescript duplicates declarations for references with sibling keywords.

- Where: `src/eslint/utils/normalizeRuleSchema.ts`
- Problem: a `$ref` carrying a `description` (as in `unicorn/name-replacements`) is compiled as a new schema with the same name, emitting the same interface twice and failing the type check with duplicate index signatures. The rule types generator drops the keywords next to a `$ref`, which JSON Schema draft 4 ignores anyway.
- Fix: once `json-schema-to-typescript-lite` (through `eslint-typegen`) deduplicates these declarations, remove the `$ref` normalization.
