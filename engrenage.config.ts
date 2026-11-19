import { pascal } from "@auaust/toolkit";

import { role, utils, type RoleLocation } from "#project/roles/index";
import { extension } from "#tools/eslint/roles/index";
import { defineConfig } from "#workflows/config/index";

function definerFile({ lineage }: RoleLocation): string {
  const owner = lineage.at(-1);

  if (owner === undefined) {
    throw new Error("A config role sits outside any namespace or domain");
  }

  const name = pascal(owner.name);

  return name === "Config" ? "defineConfig.ts" : `define${name}Config.ts`;
}

const config = role({
  name: "config",
  purpose: "Everything that configures the domain: its definer, option declarations and sections.",
  strict: true,
  exports: "named-match",
  roles: [
    {
      name: "definers",
      purpose: "The domain's `define…Config` definer.",
      file: {
        resolve: definerFile,
        description: "define<Domain>Config.ts",
      },
      unique: true,
      exports: "named-match",
      effects: "effectful",
      rules: {
        // @debt the rule loads lazily only so a config load skips `tools/eslint`; #331 injects the tools a run needs, which may make loaders unnecessary
        "definer-entries": async () => {
          const { definerEntries } = await import("#tooling/eslint/index");

          return definerEntries;
        },
      },
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
      effects: "effectful",
      rules: {
        "section-declarations": async () => {
          const { sectionDeclarations } = await import("#tooling/eslint/index");

          return sectionDeclarations;
        },
      },
    },
  ],
});

const setup = role({
  name: "setup",
  purpose: "Init steps and sync targets of the domain.",
  exports: "named-match",
  effects: "effectful",
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
  effects: "effectful",
});

const rules = role({
  name: "rules",
  purpose: "ESLint rules a role preset carries, one per module.",
  exports: "named-match",
  effects: "effectful",
});

// @debt the modules are ESLint rule conventions, not formatting conventions, and the word collides with the `Conventions` of `project/format`
const conventions = role({
  name: "conventions",
  purpose: "Formatting conventions, discovered by category.",
  categories: true,
  exports: "default",
  // @debt conventions rank effectful because they import section values, which only the creator resolves (#231)
  effects: "effectful",
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
      Agents: "Agent runtimes: Claude and Codex settings, hooks, gates, dispatch, models, efforts.",
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
    preferred: ["claude", "codex"],
    attribution: false,
    gate: {
      commands: [
        "pnpm run support codegen --check",
        "pnpm run support pnpm --check",
      ],
    },
  },
  tests: {
    mirror: true,
    roles: [config, plugins, conventions],
  },
  build: {
    sourceExports: true,
  },
  typescript: {
    tsconfig: {
      extends: ["./data/tsconfig/library.json"],
    },
  },
  src: {
    node: 24,
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
    generated: [
      // @debt this list of generated files is a signal we miss a pattern to describe generated files, *or* that declaring them isn't necessary if the only effect is to disable prettier but we already generate them properly formatted.
      "tools/eslint/types/Rules.ts",
      "tools/eslint/types/rules/**",
      "project/build/types/BuildInput.ts",
      "project/cache/types/CacheInput.ts",
      "project/docs/types/DocsInput.ts",
      "project/environments/types/AliasesInput.ts",
      "project/environments/types/BinInput.ts",
      "project/environments/types/DataInput.ts",
      "project/environments/types/DefineInput.ts",
      "project/environments/types/DomainInput.ts",
      "project/environments/types/NamespaceInput.ts",
      "project/environments/types/RuntimeInput.ts",
      "project/environments/types/ScriptsInput.ts",
      "project/environments/types/SourceInput.ts",
      "project/environments/types/TestsInput.ts",
      "project/environments/types/ToolingInput.ts",
      "project/format/types/FormatInput.ts",
      "project/presets/types/TraitsInput.ts",
      "project/roles/types/RoleInput.ts",
      "project/structure/types/StructureInput.ts",
      "project/tsconfig/types/TypescriptInput.ts",
      "tools/agents/types/AgentsInput.ts",
      "tools/git/types/GitInput.ts",
      "tools/github/types/GithubInput.ts",
      "tools/prettier/types/PrettierInput.ts",
      "tools/vscode/types/VscodeInput.ts",
      "workflows/config/types/ConfigInput.ts",
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
      "./package.json": "package.json",
      "./github/workflows/*.yml": "data/github/workflows/*.yml",
      "./tsconfig/*.json": "data/tsconfig/*.json",
      "./schemas/*.json": "data/schemas/*.json",
    },
  },
});
