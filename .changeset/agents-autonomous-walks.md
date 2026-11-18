---
"@auaust/engrenage": minor
---

- Add an `autonomous` walk mode: the consultant settles questions with a sensible default and the walker sets aside what it cannot settle, without asking the user
- Let the integration merger review each leaf against its issue, so the walker reads no diff when a merger runs
- Return a leaf's merger findings and review gaps in one resume, and keep walked agents' reports to one line per item
- Add `walk check --depth <n|all>`, holding nested plans past that depth out of the ready set, and a walk depth mode
- Default the walk pool to 3 leaves, also set by `K = <n>`
- Reshape the tree around an issue nobody can settle, through a fresh consultant moving independent issues ahead of it
