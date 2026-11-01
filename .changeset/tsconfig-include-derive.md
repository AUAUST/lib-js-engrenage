---
"@auaust/engrenage": minor
---

- Derive the `include` of each environment tsconfig from its `dirs`, the environments inheriting it and the env file when it defines, expanding brace patterns that tsconfig globs do not support
- Exclude the `tests.fixtures` from the tests tsconfigs
- Add the `tsconfig.exclude` managed list option to every environment
