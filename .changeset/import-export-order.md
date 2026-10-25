---
"@auaust/engrenage": minor
---

Add the `importOrder`, `exportOrder` and `noUnused` conventions to the ESLint `imports` category, all autofixable.

- `importOrder` (eslint-plugin-perfectionist) groups imports by source, separated by blank lines: side-effect imports, Node builtins, packages, then project imports (subpath `#…`, internal and relative). Within each group, value imports come before type-only imports, and paths are sorted naturally. Inside braces, values come before types.
- `exportOrder` sorts exports naturally with values before types. Comments split exports into separate sections that are sorted independently, so generated blocks stay intact.
- `noUnused` (eslint-plugin-unused-imports) removes unused imports.

`support codegen barrels` now writes re-exports in the same natural order.
