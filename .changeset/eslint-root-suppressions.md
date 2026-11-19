---
"@auaust/engrenage": patch
---

- Run `eslint:fix` and `eslint:suppress` from the project root, so linting files from a subdirectory prunes only their suppressions
- Accept `eslint:suppress --prune-suppressions` without adding `--suppress-all`
