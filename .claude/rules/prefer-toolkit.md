---
paths:
  - "**/*.ts"
---

<!-- @reference @auaust/engrenage/agents/rules/prefer-toolkit.md -->

# Toolkit

## Enforced by tooling

- ESLint through `@auaust/engrenage/eslint`: the `@auaust/toolkit/object` equivalents instead of `Object.*`; `isArray` instead of `Array.isArray`; `isNull`/`isUndefined` only as callbacks, never called on a single value; `@auaust/toolkit/<helper>` subpath entries instead of the root entry in library source directories.

## Not checked by tools

- Reuse `@auaust/toolkit` helpers instead of reimplementing them, and prefer them over native methods with an equivalent.
- Runtime type checks other than a comparison with one specific value use toolkit's `is<Type>` helpers.
- When `@auaust/primitive-kit` provides the same helper, use toolkit's.

<!-- @end -->
