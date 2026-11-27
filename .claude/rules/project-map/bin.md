---
paths:
  - bin/**
---

# Project map: bin

```
bin/  The `engrenage`, `metalbrain` and `batiment` CLIs: Node programs published with the package and run in the user's project, each command thin over `src` domains.  (global roles: executable.ts)
├─ batiment  Batiment commands: walk the project structure and report how batiment classifies it.  [debt: Ships batiment's CLI inside engrenage, by an earlier decision outside engrenage's Compass.]
├─ engrenage{pnpm}  Project tooling commands.
│  └─ pnpm  Package manager maintenance commands.
└─ metalbrain{agents{rules skills} backlog github{labels} hook{claude} logs planning{issue walk}}  Metalbrain agent commands: agent integration, dispatch and runs, issue planning, GitHub metadata, the shared backlog, the agent logs, ranked search across record kinds, debt markers, and the hooks the runtimes run directly from their settings.  [debt: Ships metalbrain's CLI inside engrenage, by an earlier decision outside engrenage's Compass.]
   ├─ agents{rules skills}  Agent lifecycle and instruction commands.
   │  ├─ rules  Install shared agent rules.
   │  └─ skills  Install shared agent skills.
   ├─ backlog  Create, find, update, tap, merge, move and close backlog categories and entries and relocate their sites through the backlog file schema.
   ├─ github{labels}  Snapshot GitHub metadata and sync the current repository's labels.
   │  └─ labels  Sync the current repository's labels with the config.
   ├─ hook{claude}  Agent runtime hook commands of metalbrain.
   │  └─ claude  Claude hook events of metalbrain.
   ├─ logs  Add, find, update, tap, merge, close and count the entries of one log record kind; registered once per kind, under the kind's name.
   └─ planning{issue walk}  Draft, publish and walk planned GitHub issues.
      ├─ issue  Create, claim, check and publish issue drafts, and check published issues.
      └─ walk  Check a walked issue tree.
```

Commands: one directory per command group, whose `index.ts` declares its commands, each loading its own action module from `actions/`, and may mount commands another group's `index.ts` exports; the root group's `executable.ts` runs it; a group holds no other module.
