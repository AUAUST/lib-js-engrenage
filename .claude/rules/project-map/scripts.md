---
paths:
  - scripts/**
---

# Project map: scripts

```
scripts/  The repository's own maintenance CLI, `pnpm support`: Node programs run only in this repository, never published.  (global roles: actions constants.ts *.d.ts executable.ts)
└─ codegen  Generate source modules from authoritative definitions.
```

Commands: one directory per command group, whose `index.ts` declares it; the root group's `executable.ts` runs it and `actions/` holds one action module per command; any other module holds a command, several or a group, which a group's `index.ts` declares or loads.
