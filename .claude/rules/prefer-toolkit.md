---
paths:
  - "**/*.ts"
---

<!-- @reference @auaust/engrenage/metalbrain/rules/prefer-toolkit.md -->

# Toolkit

## Not checked by tools

- Reuse `@auaust/toolkit` helpers instead of reimplementing them, and prefer them over native methods with an equivalent.
- Runtime type checks other than a comparison with one specific value use toolkit's `is<Type>` helpers.

<!-- @end -->
