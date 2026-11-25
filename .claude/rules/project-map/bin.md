---
paths:
  - bin/**
---

# Project map: bin

```
bin/  (global roles: executable.ts *.ts)
├─ engrenage{batiment pnpm}  Project tooling commands.
│  ├─ batiment  Walk the project structure and report how batiment classifies it.
│  └─ pnpm  Package manager maintenance commands.
└─ metalbrain{agents{rules skills} backlog github{labels} hook{claude} logs planning{issue walk}}  Metalbrain agent commands: agent integration, dispatch and runs, issue planning, GitHub metadata, the shared backlog, the agent logs, debt markers, and the hooks the runtimes run directly from their settings.
   ├─ agents{rules skills}  Agent lifecycle and instruction commands.
   │  ├─ rules  Install shared agent rules.
   │  └─ skills  Install shared agent skills.
   ├─ backlog  Create, find, update, move and close backlog categories and entries and relocate their sites through the backlog file schema.
   ├─ github{labels}  Snapshot GitHub metadata and sync the current repository's labels.
   │  └─ labels  Sync the current repository's labels with the config.
   ├─ hook{claude}  Agent runtime hook commands of metalbrain.
   │  └─ claude  Claude hook events of metalbrain.
   ├─ logs  Add, find, update, close and count the entries of one log record kind; registered once per kind, under the kind's name.
   └─ planning{issue walk}  Draft, publish and walk planned GitHub issues.
      ├─ issue  Create, claim, check and publish issue drafts, and check published issues.
      └─ walk  Check a walked issue tree.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
