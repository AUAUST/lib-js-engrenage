---
"@auaust/engrenage": patch
---

- Add `metalbrain backlog create <category> <purpose>`, refusing an existing category
- Add `metalbrain backlog add <category> <title>` with `--sites`, `--why`, `--want` and `--done`, printing the new ID and writing nothing when the entry breaks the backlog file schema
- Fail `metalbrain` commands other than `hook` loudly, with a non-zero exit
