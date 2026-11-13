---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < project < tools < workflows  (global roles: types extension.ts constants.ts *.d.ts)
├─ foundation/  #foundation/…  Primitives without project knowledge.
│  ├─ blocks  Composable content blocks for generated files.
│  ├─ data  Resolve files shipped with the package.
│  ├─ extensions  Collect extensions, check their ownership and order their contributions.
│  ├─ filesystem  Read, stage and write project files.
│  ├─ jsdoc  Parse and print JSDoc blocks.
│  ├─ json  Read and edit JSON while preserving its formatting.
│  ├─ options  Declare and validate configuration options.
│  └─ processes  Run external processes.
├─ project/  #project/…  config < baseline < format < presets < roles < steps < sync < gate < cache < tsconfig < package < environments < build < workspaces < structure  Tool-agnostic project models and contract domains.
│  ├─ baseline*{editions}  Resolve browser support targets from Baseline editions.
│  │  └─ editions  Browser targets for each Baseline edition.
│  ├─ build  Resolve build outputs and the emitted package manifest.
│  ├─ cache  Cache directory of the project's tools.
│  ├─ config  Load and resolve declarative configuration sections.
│  ├─ environments  Configure source, tests, commands, tooling and data environments.
│  ├─ format*  Formatting contracts shared by tool adapters.
│  ├─ gate  Contract of the steps the gate runs.
│  ├─ package*  Read and synchronize the project package manifest.
│  ├─ presets  Project presets and their resolved traits.
│  ├─ roles*  Declare role contracts and presets.
│  ├─ steps  Contracts and helpers for project initialization steps.
│  ├─ structure  Resolve project structure and enforce its boundaries.
│  ├─ sync  Run the sync targets and settle the files they change.
│  ├─ tsconfig  Compose TypeScript project configurations.
│  └─ workspaces  Resolve workspace groups and their projects.
├─ tools/  #tools/…  One domain per external tool, holding its adapters.
│  ├─ agents*{claude* codex*}  Generate shared agent instructions, skills and contributed rule files.
│  │  ├─ claude*  Configure Claude instructions, settings and hooks.
│  │  └─ codex*  Configure Codex instructions, profiles, skills and hooks.
│  ├─ changesets*  Configure release versioning and changelogs.
│  ├─ eslint*{roles*}  Configure lint rules and project-aware checks.
│  │  └─ roles*  Role presets carrying ESLint rules, loadable without ESLint.
│  ├─ git*  Configure Git conventions and repository files.
│  ├─ github*{issues/{api contract drafts}}  Generate GitHub repository workflows; holds the GitHub issue namespace.
│  │  └─ issues/  api < contract < drafts  GitHub issues: API access, the issue contract and local drafts.
│  │     ├─ api  Reach GitHub's API: token, repositories and requests.
│  │     ├─ contract  Parse, fetch and check issues against the issue protocol, including direct `gh` writes.
│  │     └─ drafts  Read, check and publish local issue drafts.
│  ├─ jscpd  Detect duplicate code.
│  ├─ lefthook  Configure local Git hooks.
│  ├─ pnpm*  Configure package management and dependency policies.
│  ├─ prettier*  Configure code formatting.
│  ├─ shopify{theme}  Configure Shopify apps and themes.
│  │  └─ theme  Format and ignore Shopify theme files.
│  ├─ tsdown*  Configure package bundling and packaging validation.
│  ├─ typescript*{tsc}  Configure and run TypeScript checks.
│  │  └─ tsc  Run the TypeScript compiler.
│  ├─ vite*  Configure application builds and development servers.
│  ├─ vitest*  Configure and run source and distribution tests.
│  └─ vscode*  Configure editor settings and extension recommendations.
└─ workflows/  #workflows/…  Composition of tools into the config and commands.
   ├─ builtins*[collects: extension]  List every built-in extension.
   ├─ cli  Compose command definitions and their execution context.
   ├─ config*  Compose and validate the complete project configuration.
   ├─ extensions*  The extension author's surface: `defineExtension` and the contracts extensions implement and read.
   ├─ gate  Coordinate commit and agent verification gates.
   ├─ init  Initialize projects through ordered setup steps.
   └─ sync  Sync the package manifest and check its publishing.
```
