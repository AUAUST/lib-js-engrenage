---
"@auaust/engrenage": minor
---

- Add the `engrenage agents claude hook git` command, which denies `--no-verify`, `LEFTHOOK=0` and `core.hooksPath` bypasses of the commit gate
- Add the Claude settings permission rules that deny the same bypasses and allow issue field writes through `gh api`
