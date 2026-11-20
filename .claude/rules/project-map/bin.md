---
paths:
  - bin/**
---

# Project map: bin

```
bin/  (global roles: executable.ts *.ts)
├─ engrenage{agents{claude codex rules skills} batiment github{labels} planning{issue walk} pnpm}  Project tooling commands.
│  ├─ agents{claude codex rules skills}  Agent lifecycle and instruction commands.
│  │  ├─ claude  Claude lifecycle commands.
│  │  ├─ codex  Codex lifecycle commands.
│  │  ├─ rules  Install shared agent rules.
│  │  └─ skills  Install shared agent skills.
│  ├─ batiment  Walk the project structure and report how batiment classifies it.
│  ├─ github{labels}  Snapshot GitHub metadata and sync the current repository's labels.
│  │  └─ labels  Sync the current repository's labels with the config.
│  ├─ planning{issue walk}  Draft, publish and walk planned GitHub issues.
│  │  ├─ issue  Create, claim, check and publish issue drafts, and check published issues.
│  │  └─ walk  Check a walked issue tree.
│  └─ pnpm  Package manager maintenance commands.
└─ engrenage-hook{claude codex}  Agent runtime hook commands, run directly by the runtimes' settings.
   ├─ claude  Claude hook events.
   └─ codex  Codex hook events.
```

Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.
