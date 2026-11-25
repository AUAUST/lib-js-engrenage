---
"@auaust/engrenage": minor
---

- Mirror each directory of a namespace spanning several directories under its own `tests/<directory>` root key instead of the namespace's name, a nested directory such as `src/web/legacy` at `tests/src/web/legacy`
- Fail with `shared-tests-root-key` on a directory named like another namespace
