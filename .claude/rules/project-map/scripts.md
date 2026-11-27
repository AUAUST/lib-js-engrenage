---
paths:
  - scripts/**
---

# Project map: scripts

```
scripts/  The repository's own maintenance CLI, `pnpm support`: Node programs run only in this repository, never published.  (global roles: actions constants.ts *.d.ts executable.ts)
└─ codegen  Generate source modules from authoritative definitions.
```

Commands: one directory per command group, whose `index.ts` declares its commands, each loading its own action module from `actions/`, and may mount commands another group's `index.ts` exports; the root group's `executable.ts` runs it; a group holds no other module.
