---
paths:
  - scripts/**
---

# Project map: scripts

```
scripts/  The repository's own maintenance CLI, `pnpm support`: Node programs run only in this repository, never published.  (global roles: actions constants.ts *.d.ts executable.ts *.ts)
└─ codegen  Generate source modules from authoritative definitions.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
