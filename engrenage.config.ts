import { toPascalCase } from "@auaust/primitive-kit/strings";

import {
  adapters,
  constants,
  createRolePreset,
  declarations,
  entrypoint,
  enums,
  errors,
  fixtures,
  index,
  ports,
  testsetup,
  testutils,
  types,
  utils,
  type RoleLocation,
} from "#project/roles/index";
import { definerEntries, sectionDeclarations } from "#tooling/eslint/index";
import { defineConfig } from "#workflows/config/index";

// @debt the config imports the tooling barrel that `codegen barrels` regenerates after loading the config, so a barrel missing a rule breaks the codegen that would add it

function definerFile({ lineage }: RoleLocation): string {
  const owner = lineage.at(-1);

  if (owner === undefined) {
    throw new Error("A config role sits outside any namespace or domain");
  }

  const name = toPascalCase(owner.name);

  return name === "Config" ? "defineConfig.ts" : `define${name}Config.ts`;
}

const config = createRolePreset({
  name: "config",
  purpose:
    "Everything that configures the domain: its definer, option declarations and sections.",
  strict: true,
  exports: "named-match",
  roles: [
    {
      name: "definers",
      purpose: "The domain's `define…Config` definer.",
      file: definerFile,
      fileDescription: "define<Domain>Config.ts",
      unique: true,
      exports: "named-match",
      effects: "effectful",
      rules: { "definer-entries": definerEntries },
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
      rules: { "section-declarations": sectionDeclarations },
    },
  ],
});

// @debt redefined only to give `adapters` an effect level; the preset should carry it, as it does for every other role
const rankedAdapters = createRolePreset(adapters({ effects: "effectful" }));

const setup = createRolePreset({
  name: "setup",
  purpose: "Init steps and sync targets of the domain.",
  exports: "named-match",
  effects: "effectful",
});

const plugins = createRolePreset({
  name: "plugins",
  purpose: "The tool's own plugins, one per module.",
  exports: "named-match",
  effects: "effectful",
});

// @debt two contracts in one role: the identity definer `defineConfig` and argument mutators such as `ensureAnyOf` sit beside I/O, while lint ranks roles by imports only
const operations = createRolePreset({
  name: "operations",
  purpose: "Impure logic and definers of the domain.",
  exports: "named-match",
  effects: "effectful",
});

const rules = createRolePreset({
  name: "rules",
  purpose: "ESLint rules a role preset carries, one per module.",
  exports: "named-match",
  effects: "effectful",
});

// @debt the modules are ESLint rule conventions, not formatting conventions, and the word collides with the `Conventions` of `project/format`
const conventions = createRolePreset({
  name: "conventions",
  purpose: "Formatting conventions, discovered by category.",
  categories: true,
  exports: "default",
  // @debt conventions rank effectful because they import section values, which only the creator resolves (#231)
  effects: "effectful",
  discovered: true,
  index: true,
});

// @debt scripts and tooling list the same roles as src, so their maps list setup, plugins, conventions and config roles none of their modules use
const codeRoles = [
  constants(),
  declarations(),
  types(),
  utils(),
  errors(),
  enums(),
  ports(),
  rankedAdapters(),
  config(),
  setup(),
  plugins(),
  operations(),
  conventions(),
  rules(),
];

export default defineConfig({
  preset: "library",
  visibility: "private",
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
    roles: [
      index(),
      constants(),
      declarations(),
      types(),
      testutils(),
      errors(),
      enums(),
      ports(),
      rankedAdapters(),
      fixtures(),
      testsetup(),
      config(),
      plugins(),
      operations(),
      conventions(),
    ],
    dist: {
      tsconfig: {
        compilerOptions: {
          exactOptionalPropertyTypes: false,
        },
      },
    },
  },
  typescript: {
    tsconfig: {
      extends: ["./data/tsconfig/library.json"],
    },
  },
  src: {
    node: 24,
    roles: [index(), entrypoint(), ...codeRoles],
    domains: {
      "project/cache": { purpose: "Cache directory of the project's tools." },
    },
    // @debt almost no domain declares a `purpose`, so the maps list about forty bare names (`steps`, `data`, `blocks`, `presets`) and an agent must open each one to place code
    namespaces: {
      ".": { layers: ["foundation", "project", "tools", "workflows"] },
      "foundation": { purpose: "Primitives without project knowledge." },
      "project": {
        purpose: "Tool-agnostic project models and contract domains.",
        layers: [
          "config",
          "roles",
          "baseline",
          "format",
          "presets",
          "steps",
          "cache",
          "tsconfig",
          "package",
          "environments",
          "build",
          "workspaces",
          "structure",
        ],
      },
      "tools": {
        purpose: "One domain per external tool, holding its adapters.",
      },
      "workflows": {
        purpose: "Composition of tools into the config and commands.",
      },
    },
    // @debt `./config` resolves to `workflows/config` but `./config/constants` to `project/config`, and the constants subpaths are hand-listed beside the derived domain entries
    exports: {
      ".": "src/entry.ts",
      "./constants": "src/constants.ts",
      "./*/constants": "src/tools/*/constants.ts",
      "./agents/*/constants": "src/tools/agents/*/constants.ts",
      "./config/constants": "src/project/config/constants.ts",
    },
    generated: [
      // @debt this list of generated files is a signal we miss a pattern to describe generated files, *or* that declaring them isn't necessary if the only effect is to disable prettier but we already generate them properly formatted.
      "tools/eslint/types/Rules.ts",
      "tools/eslint/types/rules/**",
      "project/build/types/BuildInput.ts",
      "project/cache/types/CacheInput.ts",
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
    roles: [index(), ...codeRoles],
  },
  tooling: {
    roles: [index(), ...codeRoles],
  },
  data: {
    exports: {
      "./apis/*": "data/apis/*.d.ts",
      "./agents/templates/*.md": "data/agents/templates/*.md",
      "./agents/rules/*.md": "data/agents/rules/*.md",
      "./agents/sections/*.md": "data/agents/sections/*.md",
      "./agents/skills/*.md": "data/agents/skills/*.md",
      "./github/workflows/*.yml": "data/github/workflows/*.yml",
      "./tsconfig/*.json": "data/tsconfig/*.json",
    },
  },
});
