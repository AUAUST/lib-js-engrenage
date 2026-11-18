---
"@auaust/engrenage": patch
---

- Add `engrenage link` to link a registered repository's installed package to its local checkout without changing tracked files, with `--remove`, `--restore` and a listing of each link's state
- Fail the sync check when an install repoints a linked package away from its checkout
- Read linked checkouts at `HEAD` in `walk check`, `issue check` and the worker dispatch hook, an explicit `--checkout` winning
- Run engrenage, and the tools it starts, on a linked checkout's sources instead of its build
