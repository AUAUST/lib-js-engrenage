---
paths:
  - src/**
---

# Project map: src

```
src/  foundation < nexus < batiment < metalbrain < project < tools < workflows  The published library: ESM-only Node tooling modules the package entries expose to the projects installing it, never browser runtime code.  (global roles: types constants.ts *.d.ts *.config.ts extension.ts)
├─ batiment/  #batiment/…  report < effects < roles < scopes < environments < structure < context  The language- and tool-agnostic architectural model: walks the project, reads its metafiles and builds scopes, environments, namespaces, domains, roles and their boundaries from the facts it receives.  [debt: An architectural model standing apart from the tools engrenage orchestrates, hosted here by an earlier decision outside engrenage's Compass.]
│  ├─ context  The context port a host answers with root and scope facts, and the driver running discovery and each scope's walk over its answers.
│  ├─ effects  The effect model: the level scale and its purposes, ranks of units and their members, and the charges a use costs against a ceiling.
│  ├─ environments  Declare environment presets, their registrations and placements, and resolve the environment of each file they cover.
│  ├─ report  The structure report's diagnostics and their codes, shared by every batiment domain.
│  ├─ roles  Declare role contracts.
│  ├─ scopes  Build the scope tree: the root workspace, the workspaces in it and the IDs of their namespaces; declare namespace kinds, their relations and the namespace and domain declarations structuring them.
│  └─ structure  The structure model a walk yields: its nodes, roles and boundaries, its metafiles merged over declarations, and the checks and renderings of its report.
├─ foundation/  #foundation/…  Primitives without project knowledge.
│  ├─ blocks  Composable content blocks for generated files.
│  ├─ data  Resolve files shipped with the package.
│  ├─ extensions  Collect extensions, check their ownership and order their contributions.
│  ├─ filesystem  Read, stage and write project files.
│  ├─ jsdoc  Parse and print JSDoc blocks.
│  ├─ json  Read and edit JSON while preserving its formatting and comments, through jsonc-parser's edit API.
│  ├─ markdown  Parse Markdown structure: frontmatter, sections and prose.
│  ├─ matching  Match and rank text against queries: the query tree, swappable matchers and field-weighted ranking.
│  ├─ modules  Load lazily imported modules and resolve the export they provide.
│  ├─ options  Declare and validate configuration options.
│  ├─ processes  Run external processes.
│  └─ shell  Parse shell commands into the simple commands they run, and quote words for them.
├─ metalbrain/  #metalbrain/…  facts < records < * < instructions < runtimes  The agent layer the `metalbrain` commands serve: the facts instructions render from, agent records and their kinds, instruction files and runtime hooks.  [debt: An agent layer of its own, beyond the agent setup engrenage syncs, hosted here by an earlier decision outside engrenage's Compass.]
│  ├─ backlog*  The backlog record kind: its declaration, its categories, how its entries list, and the migration of legacy Markdown categories.
│  ├─ facts*  The manifest instructions render from: the config values agents need, word caps and output limit, and the sources of instruction fragments.
│  ├─ instructions*{builtins}  The instruction registry of sections, rules and skills built-ins and extensions register, and the instruction files: parse them, resolve their references and render their fragments and generated frontmatter.
│  │  └─ builtins  The built-in instruction entries: engrenage's own sections, rules, and skills with the agents they define.
│  ├─ kinds  Every record kind together: the kind an entry ID or a kind name names, how each kind's entries print on one line, the namespace check across kinds, the rename of former IDs and the creation times they backfill.
│  ├─ logs  The friction, discarded, pending and missing record kinds, each one YAML file, and the migration of the legacy Markdown logs.
│  ├─ records*  The record core: the kind contract, its YAML store, entry IDs, creation times, taps, schema and word-cap checks, ranked search, and the generated index.
│  └─ runtimes*{hooks}  Agent runtimes: the Claude runtime's constants and transcripts, agent runs and their stats, hook settings sync and checks, dispatch environments, hook payload checks and the ports hosts fill, over the cheap hook core.
│     └─ hooks  The cheap hook core: log each tool call with its duration, output size and dollar cost, warn subagents past their thoroughness limit and write hook outputs, loading only Node builtins and the model facts so hooks fire cheaply.
├─ nexus/  #nexus/…  Shared program-building tooling: command definition and grouping, program runs, reporting and interop helpers that know nothing of the project engrenage orchestrates.  [debt: A tooling area of its own, shared by engrenage, metalbrain and outside consumers, hosted here outside engrenage's Compass pending a split.]
│  ├─ cli*  Define commands and command groups, create programs from them and run those programs with their run context, run options and error output.
│  └─ reports  Report typed messages to the handler the running program chooses, showing only those the run's verbosity allows.
├─ project/  #project/…  config < docs < baseline < format < presets < roles < steps < sync < gate < cache < tsconfig < package < environments < build < workspaces < generators < structure  Tool-agnostic project models and contract domains.
│  ├─ baseline*{editions}  Resolve browser support targets from Baseline editions.
│  │  └─ editions  Browser targets for each Baseline edition.
│  ├─ build  Resolve build outputs and the emitted package manifest.
│  ├─ cache  Cache directory of the project's tools.
│  ├─ config  Load and resolve declarative configuration sections.
│  ├─ docs*  Doc tags, their presets and the documented exports of source files.
│  ├─ environments  Configure each environment's JavaScript side: options, sections, tsconfig and package fields.
│  ├─ format*  Formatting contracts shared by tool adapters.
│  ├─ gate  Contract of the steps the gate runs.
│  ├─ generators  Declare each scope's code generators, with the input globs triggering them and the output globs they write, and run them before the gate's steps read their output.
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
│  ├─ eslint*{effects roles*}  Configure lint rules and project-aware checks.
│  │  ├─ effects  The ECMAScript application of the effects model: turning syntax into effect charges.
│  │  └─ roles*  Role presets with their own lint rules, and those rules' loaders by role name, loadable without ESLint.
│  ├─ git*  Configure Git conventions and repository files.
│  ├─ github*{issues/{api contract drafts planning}}  Generate GitHub repository workflows; holds the GitHub issue namespace.
│  │  └─ issues/  api < contract < drafts < planning  GitHub issues: API access, the issue contract and local drafts.
│  │     ├─ api  Reach GitHub's API: token, repositories and requests.
│  │     ├─ contract  Parse, fetch and check issues against the issue contract, including direct `gh` writes.
│  │     ├─ drafts  Read, check and publish local issue drafts.
│  │     └─ planning  Activate GitHub planning: the snapshot, the planning sheet and the skills gated on it.
│  ├─ jscpd  Detect duplicate code.
│  ├─ lefthook  Configure local Git hooks.
│  ├─ metalbrain*{claude*}  Engrenage's wrapper around metalbrain: the agents config section, init steps, sync targets and the host checks agent hooks call.  [debt: Wraps metalbrain beyond the agent setup engrenage syncs, such as the host checks agent hooks call, only because metalbrain lives here by an earlier decision outside engrenage's Compass.]
│  │  └─ claude*  Engrenage's Claude glue: Claude's init steps, settings sync and word-cap check.
│  ├─ nexus  Engrenage's wrapper around nexus: the debug variable, configured debug and stale-barrel explanation its programs run with.
│  ├─ pnpm*  Configure package management and dependency policies.
│  ├─ prettier*  Configure code formatting.
│  ├─ shopify{theme{preset}}  Configure Shopify apps and themes.
│  │  └─ theme{preset}  Format Shopify theme files and contribute the `shopify-theme` preset.
│  │     └─ preset  The `shopify-theme` preset's structure in each scope selecting it: the theme's namespaces, Liquid environment and Vite output.
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
