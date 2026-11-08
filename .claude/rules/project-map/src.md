---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < project < tools < workflows  (global roles: types)
├─ foundation/  #foundation/…  Primitives without project knowledge.
│  ├─ blocks  Composable content blocks for generated files.
│  ├─ data  Resolve files shipped with the package.
│  ├─ filesystem  Read, stage and write project files.
│  ├─ json  Read and edit JSON while preserving its formatting.
│  ├─ options  Declare and validate configuration options.
│  └─ processes  Run external processes.
├─ project/  #project/…  config < roles < baseline < format < presets < steps < cache < tsconfig < package < environments < build < workspaces < structure  Tool-agnostic project models and contract domains.
│  ├─ baseline*{editions}  Resolve browser support targets from Baseline editions.
│  │  └─ editions  Browser targets for each Baseline edition.
│  ├─ build  Resolve build outputs and the emitted package manifest.
│  ├─ cache  Cache directory of the project's tools.
│  ├─ config  Load and resolve declarative configuration sections.
│  ├─ environments  Configure source, tests, commands, tooling and data environments.
│  ├─ format*  Formatting contracts shared by tool adapters.
│  ├─ package*  Read and synchronize the project package manifest.
│  ├─ presets  Project presets and their resolved traits.
│  ├─ roles*  Declare role contracts and presets.
│  ├─ steps  Contracts and helpers for project initialization steps.
│  ├─ structure  Resolve project structure and enforce its boundaries.
│  ├─ tsconfig  Compose TypeScript project configurations.
│  └─ workspaces  Resolve workspace groups and their projects.
├─ tools/  #tools/…  One domain per external tool, holding its adapters.
│  ├─ agents*{claude* codex*}  Generate shared agent instructions, skills and project maps.
│  │  ├─ claude*  Configure Claude instructions, settings and hooks.
│  │  └─ codex*  Configure Codex instructions, profiles, skills and hooks.
│  ├─ changesets*  Configure release versioning and changelogs.
│  ├─ eslint*  Configure lint rules and project-aware checks.
│  ├─ git*  Configure Git conventions and repository files.
│  ├─ github*  Generate GitHub repository workflows.
│  ├─ jscpd  Detect duplicate code.
│  ├─ lefthook  Configure local Git hooks.
│  ├─ pnpm*  Configure package management and dependency policies.
│  ├─ prettier*  Configure code formatting.
│  ├─ tsdown*  Configure package bundling and packaging validation.
│  ├─ typescript*  Configure and run TypeScript checks.
│  ├─ vite*  Configure application builds and development servers.
│  ├─ vitest*  Configure and run source and distribution tests.
│  └─ vscode*  Configure editor settings and extension recommendations.
└─ workflows/  #workflows/…  Composition of tools into the config and commands.
   ├─ cli  Compose command definitions and their execution context.
   ├─ config*  Compose and validate the complete project configuration.
   ├─ gate  Coordinate commit and agent verification gates.
   ├─ init  Initialize projects through ordered setup steps.
   └─ sync  Synchronize generated project files.
```

Effect levels, purest first: `pure` < `confined` < `observing` < `effectful`. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other.

| Role           | Purpose                                                                               | Imports where they differ |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| `index`        | The domain's public surface.                                                          |                           |
| `entrypoint`   | The package entry of a public domain, re-exporting the public subset of its surface.  |                           |
| `constants`    | Deeply read-only constants of the domain.                                             | level pure                |
| `declarations` | Ambient type declarations.                                                            |                           |
| `types`        | Types only, one per module.                                                           | type-only                 |
| `utils`        | Confined functions, one per module.                                                   | level confined            |
| `errors`       | Error classes, importable module by module.                                           | level pure                |
| `enums`        | Enumerations, one per module.                                                         | level pure                |
| `ports`        | Interfaces other domains implement, importable module by module.                      | type-only, level pure     |
| `adapters`     | Implementations of other domains' ports, importable module by module.                 | level effectful           |
| `config`       | Everything that configures the domain: its definer, option declarations and sections. |                           |
| `setup`        | Init steps and sync targets of the domain.                                            | level effectful           |
| `plugins`      | The tool's own plugins, one per module.                                               | level effectful           |
| `operations`   | Impure logic and definers of the domain.                                              | level effectful           |
| `conventions`  | Formatting conventions, discovered by category.                                       | level effectful           |
| `rules`        | ESLint rules a role preset carries, one per module.                                   | level effectful           |
