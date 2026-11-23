---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < batiment < metalbrain < project < tools < workflows  (global roles: types constants.ts *.d.ts extension.ts)
├─ batiment/  #batiment/…  report < roles < environments < scopes < structure  The language- and tool-agnostic architectural model: walks the project, reads its metafiles and builds scopes, environments, namespaces, domains, roles and their boundaries from the facts it receives.
│  ├─ environments  Declare environment kinds and the namespace and domain declarations structuring them.
│  ├─ report  The structure report's diagnostics and their codes, shared by every batiment domain.
│  ├─ roles  Declare role contracts.
│  ├─ scopes  Build the scope tree: the root workspace, the workspaces in it and the IDs of their environments.
│  └─ structure  Walk each environment, merge its metafiles over its declarations and report what the walk finds.
├─ foundation/  #foundation/…  Primitives without project knowledge.
│  ├─ blocks  Composable content blocks for generated files.
│  ├─ data  Resolve files shipped with the package.
│  ├─ extensions  Collect extensions, check their ownership and order their contributions.
│  ├─ filesystem  Read, stage and write project files.
│  ├─ jsdoc  Parse and print JSDoc blocks.
│  ├─ json  Read and edit JSON while preserving its formatting and comments, through jsonc-parser's edit API.
│  ├─ markdown  Parse Markdown structure: frontmatter, sections and prose.
│  ├─ modules  Load lazily imported modules and resolve the export they provide.
│  ├─ options  Declare and validate configuration options.
│  ├─ processes  Run external processes.
│  ├─ reports  Report typed messages to the handler the running context chooses.
│  └─ shell  Parse shell commands into the simple commands they run.
├─ metalbrain/  #metalbrain/…  facts < records < * < instructions < runtimes  The agent layer the `metalbrain` commands serve: the facts instructions render from, agent records and their kinds, instruction files and runtime hooks.
│  ├─ backlog*  The backlog record kind: its declaration, its categories, how its entries list, and the migration of legacy Markdown categories.
│  ├─ facts*  The manifest instructions render from: the config values agents need, word caps and output limit, and the sources of instruction fragments.
│  ├─ instructions*{builtins}  The instruction registry of sections, rules and skills built-ins and extensions register, and the instruction files: parse them, resolve their references and render their fragments and generated frontmatter.
│  │  └─ builtins  The built-in instruction entries: engrenage's own sections, rules, and skills with the agents they define.
│  ├─ logs  The friction, discarded and pending record kinds, each one YAML file, and the migration of the legacy Markdown logs.
│  ├─ records*  The record core: the kind contract, its YAML store, entry IDs, schema and word-cap checks, and the generated index.
│  └─ runtimes*{hooks}  Agent runtimes: the Claude runtime's constants and transcripts, agent runs and their stats, hook settings sync and checks, dispatch environments, hook payload checks and the ports hosts fill, over the cheap hook core.
│     └─ hooks  The cheap hook core: log each tool call with its duration, output size and dollar cost, warn subagents past their thoroughness limit and write hook outputs, loading only Node builtins and the model facts so hooks fire cheaply.
├─ project/  #project/…  config < docs < baseline < format < presets < roles < steps < sync < gate < cache < tsconfig < package < environments < build < workspaces < structure  Tool-agnostic project models and contract domains.
│  ├─ baseline*{editions}  Resolve browser support targets from Baseline editions.
│  │  └─ editions  Browser targets for each Baseline edition.
│  ├─ build  Resolve build outputs and the emitted package manifest.
│  ├─ cache  Cache directory of the project's tools.
│  ├─ config  Load and resolve declarative configuration sections.
│  ├─ docs*  Doc tags, their presets and the documented exports of source files.
│  ├─ environments  Configure each environment's JavaScript side: options, sections, tsconfig and package fields.
│  ├─ format*  Formatting contracts shared by tool adapters.
│  ├─ gate  Contract of the steps the gate runs.
│  ├─ package*  Read and synchronize the project package manifest.
│  ├─ presets  Project presets and their resolved traits.
│  ├─ roles*  Contribute the generic role presets and own the `roles` slot.
│  ├─ steps  Contracts and helpers for project initialization steps.
│  ├─ structure  Bind the batiment structure model to the config, TypeScript resolution, the project-map rule files and the gate.
│  ├─ sync  Run the sync targets and settle the files they change.
│  ├─ tsconfig  Compose TypeScript project configurations.
│  └─ workspaces  Resolve workspace groups and their projects.
├─ tools/  #tools/…  One domain per external tool, holding its adapters.
│  ├─ agents{claude}  Holds the Claude runtime registration until it joins `tools/metalbrain/claude`.
│  │  └─ claude  The Claude runtime: its constants and headless dispatch.
│  ├─ changesets*  Configure release versioning and changelogs.
│  ├─ eslint*{roles*}  Configure lint rules and project-aware checks.
│  │  └─ roles*  Role presets carrying ESLint rules, loadable without ESLint.
│  ├─ git*  Configure Git conventions and repository files.
│  ├─ github*{issues/{api contract drafts planning}}  Generate GitHub repository workflows; holds the GitHub issue namespace.
│  │  └─ issues/  api < contract < drafts < planning  GitHub issues: API access, the issue contract and local drafts.
│  │     ├─ api  Reach GitHub's API: token, repositories and requests.
│  │     ├─ contract  Parse, fetch and check issues against the issue contract, including direct `gh` writes.
│  │     ├─ drafts  Read, check and publish local issue drafts.
│  │     └─ planning  Activate GitHub planning: the snapshot, the planning sheet and the skills gated on it.
│  ├─ jscpd  Detect duplicate code.
│  ├─ lefthook  Configure local Git hooks.
│  ├─ metalbrain*{claude*}  Engrenage's wrapper around metalbrain: the agents config section, init steps, sync targets and the host checks agent hooks call.
│  │  └─ claude*  Engrenage's Claude glue: Claude's init steps, settings sync and word-cap check.
│  ├─ pnpm*  Configure package management and dependency policies.
│  ├─ prettier*{preset*}  Configure code formatting.
│  │  └─ preset*  The ready-made Prettier config, for Prettier to load from `package.json`.
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
