---
title: TypeScript
description: Write and validate TypeScript code.
category: coding-style
default: true
order: 50
---

## TypeScript

- Infer types from schemas, factories and API definitions instead of duplicating them. Preserve strict compiler settings and real optional contracts.
- Use interfaces for object shapes and type aliases for unions, functions and mapped types. Name types after the concept they carry. Never alias a mutable list (`Type[]`) under a new name; a read-only list (`readonly Type[]` or `ReadonlyArray<Type>`) may get one.
- Do not add `any`, casts, assertions, `@ts-*` directives or `eslint-disable` comments without a supported invariant. Disabled lint rules are not permission. Never add entries to `eslint-suppressions.json` unless explicitly requested.
- Validate data at external boundaries. Never hand-edit generated code, bundles or WebAssembly; change their sources and regenerate.
- `typescript` stays pinned to an exact version: minor releases change what each `lib` contains. Upgrade it only deliberately, reviewing the `lib` changes.
