---
paths:
  - scripts/**
---

# Project map: scripts

```
scripts/  The repository's own maintenance programs, which engrenage runs as project scripts: Node programs run only in this repository, never published.  (global roles: constants.ts *.d.ts executable.ts)
├─ codegen  Generate source modules from authoritative definitions.
└─ pnpm  Compare the pnpm range engrenage ships with the newest pnpm.
```

Programs: one directory per program, whose `index.ts` default-exports the program and whose optional `executable.ts` only hands it to nexus's `launch`; below it, one directory per command group, whose `index.ts` declares it; `actions/` holds one action module per command; any other module holds a command, several or a group, which a group's `index.ts` declares or loads.
