import { freeze } from "@auaust/toolkit/object";

export const sourceDomains = freeze({
  "foundation/blocks": {
    internals: true,
    purpose: "Composable content blocks for generated files.",
  },
  "foundation/data": {
    purpose: "Resolve files shipped with the package.",
  },
  "foundation/extensions": {
    purpose:
      "Collect extensions, check their ownership and order their contributions.",
  },
  "foundation/filesystem": {
    internals: true,
    purpose: "Read, stage and write project files.",
  },
  "foundation/json": {
    purpose: "Read and edit JSON while preserving its formatting.",
  },
  "foundation/options": {
    internals: true,
    purpose: "Declare and validate configuration options.",
  },
  "foundation/processes": {
    purpose: "Run external processes.",
  },
  "project/baseline": {
    purpose: "Resolve browser support targets from Baseline editions.",
  },
  "project/baseline/editions": {
    purpose: "Browser targets for each Baseline edition.",
  },
  "project/build": {
    purpose: "Resolve build outputs and the emitted package manifest.",
  },
  "project/cache": {
    purpose: "Cache directory of the project's tools.",
  },
  "project/config": {
    purpose: "Load and resolve declarative configuration sections.",
  },
  "project/environments": {
    purpose:
      "Configure source, tests, commands, tooling and data environments.",
  },
  "project/format": {
    purpose: "Formatting contracts shared by tool adapters.",
  },
  "project/package": {
    purpose: "Read and synchronize the project package manifest.",
  },
  "project/gate": {
    purpose: "Contract of the steps the gate runs.",
  },
  "project/presets": {
    purpose: "Project presets and their resolved traits.",
  },
  "project/roles": {
    purpose: "Declare role contracts and presets.",
  },
  "project/steps": {
    purpose: "Contracts and helpers for project initialization steps.",
  },
  "project/structure": {
    purpose: "Resolve project structure and enforce its boundaries.",
  },
  "project/sync": {
    purpose: "Run the sync targets and settle the files they change.",
  },
  "project/tsconfig": {
    purpose: "Compose TypeScript project configurations.",
  },
  "project/workspaces": {
    purpose: "Resolve workspace groups and their projects.",
  },
  "tools/agents": {
    purpose: "Generate shared agent instructions, skills and project maps.",
  },
  "tools/agents/claude": {
    purpose: "Configure Claude instructions, settings and hooks.",
  },
  "tools/agents/codex": {
    purpose: "Configure Codex instructions, profiles, skills and hooks.",
  },
  "tools/changesets": {
    purpose: "Configure release versioning and changelogs.",
  },
  "tools/eslint": {
    purpose: "Configure lint rules and project-aware checks.",
  },
  "tools/eslint/roles": {
    purpose: "Role presets carrying ESLint rules, loadable without ESLint.",
  },
  "tools/git": {
    purpose: "Configure Git conventions and repository files.",
  },
  "tools/github": {
    purpose: "Generate GitHub repository workflows.",
  },
  "tools/jscpd": {
    purpose: "Detect duplicate code.",
  },
  "tools/lefthook": {
    purpose: "Configure local Git hooks.",
  },
  "tools/pnpm": {
    purpose: "Configure package management and dependency policies.",
  },
  "tools/prettier": {
    purpose: "Configure code formatting.",
  },
  "tools/shopify": {
    purpose: "Configure Shopify apps and themes.",
  },
  "tools/shopify/theme": {
    purpose: "Format and ignore Shopify theme files.",
  },
  "tools/tsdown": {
    purpose: "Configure package bundling and packaging validation.",
  },
  "tools/typescript": {
    purpose: "Configure and run TypeScript checks.",
  },
  "tools/typescript/tsc": {
    purpose: "Run the TypeScript compiler.",
  },
  "tools/vite": {
    purpose: "Configure application builds and development servers.",
  },
  "tools/vitest": {
    purpose: "Configure and run source and distribution tests.",
  },
  "tools/vscode": {
    purpose: "Configure editor settings and extension recommendations.",
  },
  "workflows/builtins": {
    purpose: "List every built-in extension.",
  },
  "workflows/cli": {
    purpose: "Compose command definitions and their execution context.",
  },
  "workflows/config": {
    purpose: "Compose and validate the complete project configuration.",
  },
  "workflows/gate": {
    purpose: "Coordinate commit and agent verification gates.",
  },
  "workflows/init": {
    purpose: "Initialize projects through ordered setup steps.",
  },
  "workflows/sync": {
    purpose: "Sync the package manifest and check its publishing.",
  },
} as const);

export const binDomains = freeze({
  "engrenage": {
    purpose: "Project tooling commands.",
  },
  "engrenage/agents": {
    purpose: "Agent lifecycle and instruction commands.",
  },
  "engrenage/agents/claude": {
    purpose: "Claude lifecycle commands.",
  },
  "engrenage/agents/claude/hook": {
    purpose: "Handle Claude lifecycle hook events.",
  },
  "engrenage/agents/codex": {
    purpose: "Codex lifecycle commands.",
  },
  "engrenage/agents/codex/hook": {
    purpose: "Handle Codex lifecycle hook events.",
  },
  "engrenage/agents/rules": {
    purpose: "Install shared agent rules.",
  },
  "engrenage/agents/skills": {
    purpose: "Install shared agent skills.",
  },
  "engrenage/issues": {
    purpose: "Check GitHub issues against the issue contract.",
  },
  "engrenage/pnpm": {
    purpose: "Package manager maintenance commands.",
  },
} as const);

export const scriptsDomains = freeze({
  codegen: {
    purpose: "Generate source modules from authoritative definitions.",
  },
} as const);

export const toolingDomains = freeze({
  eslint: {
    purpose: "Repository-specific ESLint rules.",
  },
} as const);
