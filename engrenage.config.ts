import { role } from "#batiment/roles/index";
import { utils } from "#project/roles/index";
import { extension } from "#tools/eslint/roles/index";
import { defineConfig } from "#workflows/config/index";

const config = role({
  name: "config",
  purpose: "Everything that configures the domain: its definer, option declarations and sections.",
  strict: true,
  exports: "named-match",
  roles: [
    {
      name: "definers",
      purpose: "The domain's `define…Config` definer.",
      // @debt `defineConfig.ts` matches in every domain only so the `config` domain's definer drops the doubled `Config`
      file: ["define<Domain>Config.ts", "defineConfig.ts"],
      unique: true,
      exports: "named-match",
      effects: { evaluation: "confined", invocation: "effectful" },
    },
    {
      name: "schemas",
      purpose: "Validation schemas of the option declarations.",
      accepts: "*Schema.ts",
      exports: "named-match",
      effects: "confined",
    },
    {
      name: "declarers",
      purpose: "Functions creating option declarations.",
      accepts: "declare*.ts",
      exports: "named-match",
      effects: "confined",
    },
    {
      name: "sections",
      purpose: "Section values the domain contributes to the loaded config.",
      accepts: "*Section.ts",
      exports: "named-match",
      effects: { evaluation: "confined", invocation: "effectful" },
    },
  ],
});

const setup = role({
  name: "setup",
  purpose: "Init steps and sync targets of the domain.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});

const presets = role({
  name: "presets",
  purpose: "Presets of the domain's declarations, one per module.",
  exports: { values: "named-match", types: "none" },
  effects: "confined",
});

const plugins = role({
  name: "plugins",
  purpose: "The tool's own plugins, one per module.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});

const rules = role({
  name: "rules",
  purpose: "ESLint rules lint runs on the files of a role, one per module.",
  exports: "named-match",
  effects: { evaluation: "confined", invocation: "effectful" },
});

// @debt the modules are ESLint rule conventions, not formatting conventions, and the word collides with the `Conventions` of `project/format`
const conventions = role({
  name: "conventions",
  purpose: "Formatting conventions, discovered by category.",
  categories: true,
  exports: "default",
  // @debt conventions rank effectful because they import section values, which only the creator resolves (#231)
  effects: { evaluation: "confined", invocation: "effectful" },
  discovered: true,
  index: true,
});

const strictUtils = utils({
  exports: { values: "named-match", types: "none" },
});

export default defineConfig({
  preset: "library",
  visibility: "private",
  github: {
    testShards: 4,
    repositories: {
      interscript: "AUAUST/clients-intscr-shopify",
    },
    labels: {
      Agents: "Agent runtimes: Claude settings, hooks, gates, dispatch, models, efforts.",
      CLI: "Commands, actions and process handling.",
      Configuration: "Config loading, options, sections and definers.",
      Dependencies: "pnpm, dependency policies, peer and bundled dependencies.",
      Documentation: "Public documentation: README, JSDoc and contract docs.",
      Editor: "Editor settings, integrations and JSON Schemas.",
      Extensions: "The extension registry and the surfaces extensions contribute.",
      Formatting: "Formatting conventions and their enforcement: Prettier, editor and synced files.",
      Gate: "The commit and agent gates.",
      Git: "Commit conventions, Git hooks and repository files.",
      Init: "Project initialization steps.",
      Linting: "Lint rules and conventions, other than structure boundaries.",
      Metalbrain: "Instruction content: AGENTS.md sections, rule files and skills.",
      Packaging: "Build outputs, entries and exports, the emitted manifest and bundling.",
      Planning: "The issue contract, drafts, planning commands and the GitHub snapshot.",
      Presets: "Project and platform presets.",
      Release: "Changesets, versions, changelogs and publishing workflows.",
      Structure: "Namespaces, domains, roles, aliases, barrels, project maps and import boundaries.",
      Sync: "Sync targets, synced and generated files.",
      Tests: "The test runner, test selection and the test suites.",
      TypeScript: "tsconfig composition, type checking and declarations.",
    },
  },
  agents: {
    compass: "Engrenage orchestrates projects from around their code: it centralises each project's configuration and syncs everything that shapes, checks and ships that code (dependencies, formatting, linting, type checking, tests, builds, git hooks, CI, agent setup) from opinionated defaults the project can extend. It makes those tools work as one: each fact has a single source, each convention is stated once and dispatched to every tool that applies it, and no two tools conflict.",
    preferred: ["claude"],
    attribution: false,
    gate: {
      commands: ["pnpm run support pnpm --check"],
    },
  },
  generators: {
    codegen: {
      command: "pnpm run support codegen",
      inputs: [
        "src/**",
        "scripts/index.ts",
        "scripts/codegen/**",
        "engrenage.config.ts",
        "package.json",
        "pnpm-lock.yaml",
      ],
      outputs: [
        "src/project/baseline/editions/constants.ts",
        "data/apis/**/*.d.ts",
        "data/schemas/*.schema.json",
        "src/tools/eslint/types/Rules.ts",
        "src/tools/eslint/types/rules/*.ts",
        "src/workflows/config/types/ConfigInput.ts",
        // @debt the config input types are listed one by one: their names come from the config schemas' export names, which no glob matches apart from the hand-written `ObjectInput.ts`
        "src/batiment/roles/types/RoleInput.ts",
        "src/batiment/scopes/types/DomainInput.ts",
        "src/batiment/scopes/types/NamespaceInput.ts",
        "src/project/build/types/BuildInput.ts",
        "src/project/cache/types/CacheInput.ts",
        "src/project/docs/types/DocsInput.ts",
        "src/project/environments/types/AliasesInput.ts",
        "src/project/environments/types/BinInput.ts",
        "src/project/environments/types/DataInput.ts",
        "src/project/environments/types/DefineInput.ts",
        "src/project/environments/types/RuntimeInput.ts",
        "src/project/environments/types/ScriptsInput.ts",
        "src/project/environments/types/SourceInput.ts",
        "src/project/environments/types/StaticInput.ts",
        "src/project/environments/types/TestsInput.ts",
        "src/project/environments/types/ToolingInput.ts",
        "src/project/format/types/FormatInput.ts",
        "src/project/presets/types/TraitsInput.ts",
        "src/project/structure/types/StructureInput.ts",
        "src/project/tsconfig/types/TypescriptInput.ts",
        "src/project/workspaces/types/WorkspacesInput.ts",
        "src/tools/git/types/GitInput.ts",
        "src/tools/github/types/GithubInput.ts",
        "src/tools/metalbrain/types/AgentsInput.ts",
        "src/tools/prettier/types/PrettierInput.ts",
        "src/tools/vscode/types/VscodeInput.ts",
      ],
    },
  },
  tests: {
    mirror: true,
    roles: [config, plugins, conventions],
    structure: {
      purpose: "Vitest suites run in Node against the source and the built package, mirroring the environments they test.",
    },
  },
  build: {
    sourceExports: true,
  },
  typescript: {
    tsconfig: {
      extends: ["./data/tsconfig/library.json"],
    },
  },
  environments: {
    src: {
      execution: { globals: "node", syntax: 24 },
    },
  },
  src: {
    roles: [
      extension(),
      strictUtils,
      config,
      setup,
      plugins,
      conventions,
      rules,
      presets,
    ],
  },
  scripts: {
    roles: [strictUtils],
  },
  tooling: {
    roles: [strictUtils, rules],
  },
  data: {
    exports: {
      "./effects/*.json": "data/effects/*.json",
      "./apis/*": "data/apis/*.d.ts",
      "./metalbrain/templates/*.md": "data/metalbrain/templates/*.md",
      "./metalbrain/rules/*.md": "data/metalbrain/rules/*.md",
      "./metalbrain/sections/*.md": "data/metalbrain/sections/*.md",
      "./metalbrain/skills/*.md": "data/metalbrain/skills/*.md",
      "./metalbrain/shared/*.md": "data/metalbrain/shared/*.md",
      "./metalbrain/models.json": "data/metalbrain/models.json",
      "./metalbrain/thoroughness.json": "data/metalbrain/thoroughness.json",
      "./package.json": "package.json",
      "./github/workflows/*.yml": "data/github/workflows/*.yml",
      "./tsconfig/*.json": "data/tsconfig/*.json",
      "./schemas/*.json": "data/schemas/*.json",
    },
  },
});
