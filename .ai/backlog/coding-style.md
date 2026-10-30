# coding-style

Coding style conventions, ESLint behavior and linting gaps.

## 1. Only the root `.gitignore` applies.

- Where: `src/eslint/utils/createIgnoreRules.ts`
- Problem: `includeIgnoreFile` reads `files.gitignore` only, so nested `.gitignore` files (such as `tests/fixtures/eslint/.gitignore`) do not apply to the root lint run, unlike Git.
- Fix: decide whether nested ignore files are honored; if so, include each one found under the root, scoped to its directory.
