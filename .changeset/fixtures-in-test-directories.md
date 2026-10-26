---
"@auaust/engrenage": minor
---

`files.fixtures` is matched inside each test directory, and the resolved `config.files.fixtures` lists the resulting root-relative globs (`tests/**/fixtures/**` by default). ESLint ignores and Vitest excludes the same files.

**Breaking:**

- Vitest no longer excludes fixture directories outside the test directories.
- `config.files.fixtures` is a list of globs instead of a single glob.
- `filesIn` moves from `@auaust/engrenage/eslint` to the root entry.
