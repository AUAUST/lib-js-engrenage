---
paths:
  - scripts/**
---

# Project map: scripts

```
scripts/  (global roles: actions constants.ts *.d.ts executable.ts *.ts)
└─ codegen  Generate source modules from authoritative definitions.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
