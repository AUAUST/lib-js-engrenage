---
title: Primitive kit
description: Reuse primitive-kit helpers.
category: tools-dependencies
default: false
order: 30
paths:
  - "**/*.ts"
---

# Primitive kit

## Enforced by tooling

- ESLint through `@auaust/engrenage/eslint`: `@auaust/primitive-kit/<domain>` subpath entries instead of the root entry in library source directories.

## Not checked by tools

- Reuse `@auaust/primitive-kit` helpers instead of reimplementing them, and prefer them over native methods with an equivalent (`sort(array)` rather than `array.sort()`).
