---
"@auaust/engrenage": minor
---

- Add `engrenage gate [--staged | --worktree]`, which fixes and checks the changed files (ESLint, Prettier, types, structure, sync, related tests, `agents.gate.commands`) and remembers the trees that passed
- Add the `agents.gate` option (`commands`, `hook`)
- Add the lefthook init step and `engrenage sync lefthook`, which run the gate before agent commits
