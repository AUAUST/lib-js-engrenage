---
"@auaust/engrenage": minor
---

- Run `engrenage eslint`, `eslint:fix` and `eslint:suppress` without a cache, which kept type-aware rules passing after imported types changed; pass `--cache` to opt back in
- Drop the redundant `--no-cache` from the generated `ci:check` script
