---
"@auaust/engrenage": patch
---

- Read a leading `run` in `vitest`, `vitest:coverage` and `vitest:dist`, and `watch` or `dev` in `vitest:watch`, as the mode they already run instead of a file filter, and reject a leading mode they never run
- Print full paths in `jscpd` clone reports instead of bare file names
- Warn when `gate` finds no staged file while unstaged changes exist, naming them and `--worktree`
- Take a new draft's slug without its `new-` prefix in `planning issue create --parent` and `--after`
