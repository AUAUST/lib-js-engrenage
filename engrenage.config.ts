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
import { extension } from "#tools/eslint/roles/index";
import { defineConfig } from "#workflows/config/index";

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

// @debt two contracts in one role: the identity definer `defineConfig` sits beside I/O, while lint ranks roles by imports only
const operations = createRolePreset({
  name: "operations",
  purpose: "Effectful logic of the domain.",
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
  utils({
    exports: { values: "named-match", types: "none" },
  }),
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
  github: {
    testShards: 4,
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
    roles: [index(), entrypoint(), extension(), ...codeRoles],
    // @debt `./config/constants` resolves to `project/config` while `./config` is `workflows/config`, and the constants of the internal domains jscpd, lefthook and shopify are hand-listed
    exports: {
      "./config/constants": "src/project/config/constants.ts",
      "./jscpd/constants": "src/tools/jscpd/constants.ts",
      "./lefthook/constants": "src/tools/lefthook/constants.ts",
      "./shopify/constants": "src/tools/shopify/constants.ts",
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
    roles: codeRoles,
  },
  tooling: {
    roles: [index(), ...codeRoles],
  },
  data: {
    exports: {
      "./effects/*.json": "data/effects/*.json",
      "./apis/*": "data/apis/*.d.ts",
      "./agents/templates/*.md": "data/agents/templates/*.md",
      "./agents/rules/*.md": "data/agents/rules/*.md",
      "./agents/sections/*.md": "data/agents/sections/*.md",
      "./agents/skills/*.md": "data/agents/skills/*.md",
      "./github/workflows/*.yml": "data/github/workflows/*.yml",
      "./tsconfig/*.json": "data/tsconfig/*.json",
      "./schemas/*.json": "data/schemas/*.json",
    },
  },
});
