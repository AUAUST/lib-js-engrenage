---
paths:
  - bin/**
---

# Project map: bin

```
bin/  (global roles: executable.ts *.ts)
└─ engrenage{agents{claude{hook} codex{hook} rules skills} github planning{issue walk} pnpm}  Project tooling commands.
   ├─ agents{claude{hook} codex{hook} rules skills}  Agent lifecycle and instruction commands.
   │  ├─ claude{hook}  Claude lifecycle commands.
   │  │  └─ hook  Handle Claude lifecycle hook events.
   │  ├─ codex{hook}  Codex lifecycle commands.
   │  │  └─ hook  Handle Codex lifecycle hook events.
   │  ├─ rules  Install shared agent rules.
   │  └─ skills  Install shared agent skills.
   ├─ github  Snapshot GitHub metadata of the registered repositories.
   ├─ planning{issue walk}  Draft, publish and walk planned GitHub issues.
   │  ├─ issue  Create and check issue drafts, and check published issues.
   │  └─ walk  Check a walked issue tree.
   └─ pnpm  Package manager maintenance commands.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
