---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < project < tools < workflows  (global roles: types)
├─ foundation/  #foundation/…  blocks data filesystem json options processes
├─ project/  #project/…  baseline*{editions} build config environments format* package* presets steps structure tsconfig workspaces
├─ tools/  #tools/…  agents*{claude* codex*} changesets* eslint* git* github* pnpm* prettier* tsdown* typescript* vite* vitest* vscode*
└─ workflows/  #workflows/…  cli config* init registry sync
```

Effect levels, purest first: `pure` < `confined` < `effectful`. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other.

| Role           | Purpose                                                                              | Imports where they differ |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `index`        | The domain's public surface.                                                         |                           |
| `entry`        | The package entry of a public domain, re-exporting the public subset of its surface. |                           |
| `constants`    | Deeply read-only constants of the domain.                                            | level pure                |
| `declarations` | Ambient type declarations.                                                           |                           |
| `types`        | Types only, one per module.                                                          | type-only                 |
| `utils`        | Confined functions, one per module.                                                  | level confined            |
| `errors`       | Error classes, importable module by module.                                          | level pure                |
| `enums`        | Enumerations, one per module.                                                        | level pure                |
| `ports`        | Interfaces other domains implement, importable module by module.                     | type-only, level pure     |
| `adapters`     | Implementations of other domains' ports, importable module by module.                | level effectful           |
| `config`       | Confined option declarations of the domain.                                          | level confined            |
| `setup`        | Init steps and sync targets of the domain.                                           | level effectful           |
| `plugins`      | The tool's own plugins, one per module.                                              | level effectful           |
| `operations`   | Impure logic and definers of the domain.                                             | level effectful           |
| `conventions`  | Formatting conventions, discovered by category.                                      | level confined            |
