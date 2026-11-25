---
"@auaust/engrenage": patch
---

- Have agents add records without searching first, act on the similar entries `add` lists, pass `--keywords` for duplicates worded otherwise, and chain writes with `--next`
- Have orchestrating main sessions log each follow-up they leave for later as a pending entry with its owner, and close it once handled
- Run walk mergers only at segment, nested-plan, task-tree-top and walk-end boundaries, commit leaves without a per-leaf review, and have mergers start from the full test suite and fix their findings themselves
- Gate the merger agent's stop on the worktree gate
