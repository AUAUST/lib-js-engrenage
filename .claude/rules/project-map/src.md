---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < project < tools < workflows  (global roles: types)
├─ foundation/  #foundation/…  blocks data filesystem json options processes  Primitives without project knowledge.
├─ project/  #project/…  roles < *  baseline*{editions} build config environments format* package* presets roles* steps structure tsconfig workspaces  Tool-agnostic project models and contract domains.
├─ tools/  #tools/…  agents*{claude* codex*} changesets* eslint* git* github* lefthook pnpm* prettier* tsdown* typescript* vite* vitest* vscode*  One domain per external tool, holding its adapters.
└─ workflows/  #workflows/…  cli config* gate init registry sync  Composition of tools into the registry and commands.
```

Effect levels, purest first: `pure` < `confined` < `effectful`. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other.

| Role           | Purpose                                                                              | Imports where they differ |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| `index`        | The domain's public surface.                                                         |                           |
| `entrypoint`   | The package entry of a public domain, re-exporting the public subset of its surface. |                           |
| `constants`    | Deeply read-only constants of the domain.                                            | level pure                |
| `declarations` | Ambient type declarations.                                                           |                           |
| `types`        | Types only, one per module.                                                          | type-only                 |
| `utils`        | Confined functions, one per module.                                                  | level confined            |
| `errors`       | Error classes, importable module by module.                                          | level pure                |
| `enums`        | Enumerations, one per module.                                                        | level pure                |
| `ports`        | Interfaces other domains implement, importable module by module.                     | type-only, level pure     |
| `adapters`     | Implementations of other domains' ports, importable module by module.                | level effectful           |
| `config`       | The domain's config section: its declaration and resolver.                           | level confined            |
| `declarers`    | Functions creating option declarations.                                              | level confined            |
| `definers`     | The tool's `define…Config` definers.                                                 | level effectful           |
| `setup`        | Init steps and sync targets of the domain.                                           | level effectful           |
| `plugins`      | The tool's own plugins, one per module.                                              | level effectful           |
| `operations`   | Impure logic and definers of the domain.                                             | level effectful           |
| `conventions`  | Formatting conventions, discovered by category.                                      | level confined            |
