---
title: Toolkit
description: Reuse toolkit helpers.
category: tools-dependencies
default: false
order: 40
paths:
  - "**/*.ts"
---

# Toolkit

## Not checked by tools

- Reuse `@auaust/toolkit` helpers instead of reimplementing them, and prefer them over native methods with an equivalent.
- Runtime type checks other than a comparison with one specific value use toolkit's `is<Type>` helpers.
- When `@auaust/primitive-kit` provides the same helper, use toolkit's.
