---
paths:
  - bin/**
---

# Project map: bin

```
bin/  (global roles: executable.ts *.ts)
└─ engrenage{agents{claude{hook} codex{hook} rules skills} issues pnpm}  Project tooling commands.
   ├─ agents{claude{hook} codex{hook} rules skills}  Agent lifecycle and instruction commands.
   │  ├─ claude{hook}  Claude lifecycle commands.
   │  │  └─ hook  Handle Claude lifecycle hook events.
   │  ├─ codex{hook}  Codex lifecycle commands.
   │  │  └─ hook  Handle Codex lifecycle hook events.
   │  ├─ rules  Install shared agent rules.
   │  └─ skills  Install shared agent skills.
   ├─ issues  Check GitHub issues against the issue contract.
   └─ pnpm  Package manager maintenance commands.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
