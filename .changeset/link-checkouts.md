---
"@auaust/engrenage": patch
---

- Add `engrenage link` to link a registered repository's installed package to its local checkout without changing tracked files, with `--remove`, `--restore` and a listing of each link's state
- Fail the sync check when an install repoints a linked package away from its checkout
