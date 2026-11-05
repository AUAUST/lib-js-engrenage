import { defineConfig } from "#workflows/config/index";

export default defineConfig({
  preset: "library",
  // @debt these roles are defined for every environment, so scripts, tests and tooling maps list setup, plugins, conventions and config roles none of their modules can use
  roles: {
    define: {
      config: {
        purpose: "The domain's config section: its declaration and resolver.",
        exports: "named-match",
        effects: "confined",
        roles: [
          {
            name: "schemas",
            purpose: "Validation schemas of the option declarations.",
            exports: "named-match",
            effects: "confined",
          },
        ],
      },
      declarers: {
        purpose: "Functions creating option declarations.",
        exports: "named-match",
        effects: "confined",
      },
      definers: {
        purpose: "The tool's `define…Config` definers.",
        exports: "named-match",
        effects: "effectful",
      },
      // @debt redefined only to give `adapters` an effect level; the catalogue should carry it, as it does for every other role
      adapters: { inherit: "adapters", effects: "effectful" },
      setup: {
        purpose: "Init steps and sync targets of the domain.",
        exports: "named-match",
        effects: "effectful",
      },
      plugins: {
        purpose: "The tool's own plugins, one per module.",
        exports: "named-match",
        effects: "effectful",
      },
      // @debt two contracts in one role: the identity definer `defineConfig` and argument mutators such as `ensureAnyOf` sit beside I/O, while lint ranks roles by imports only
      operations: {
        purpose: "Impure logic and definers of the domain.",
        exports: "named-match",
        effects: "effectful",
      },
      // @debt the modules are ESLint rule conventions, not formatting conventions, and the word collides with the `Conventions` of `project/format`
      conventions: {
        purpose: "Formatting conventions, discovered by category.",
        categories: true,
        exports: "default",
        effects: "confined",
        discovered: true,
        index: true,
      },
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
    layout: "mirror",
    roles: {
      define: {
        // @debt inherits the purpose "Confined functions" while raising the level to effectful, so the structure report contradicts itself for `tests/utils`
        utils: { inherit: "utils", effects: "effectful" },
      },
    },
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
    // @debt no domain declares a `purpose`, so the maps list about forty bare names (`steps`, `data`, `blocks`, `presets`) and an agent must open each one to place code
    namespaces: {
      ".": { layers: ["foundation", "project", "tools", "workflows"] },
      "foundation": { purpose: "Primitives without project knowledge." },
      "project": {
        purpose: "Tool-agnostic project models and contract domains.",
      },
      "tools": {
        purpose: "One domain per external tool, holding its adapters.",
      },
      "workflows": {
        purpose: "Composition of tools into the registry and commands.",
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
      "project/config/types/CacheInput.ts",
      "project/config/types/DefineInput.ts",
      "project/environments/types/BinInput.ts",
      "project/environments/types/DataInput.ts",
      "project/environments/types/RuntimeInput.ts",
      "project/environments/types/ScriptsInput.ts",
      "project/environments/types/SourceInput.ts",
      "project/environments/types/TestsInput.ts",
      "project/environments/types/ToolingInput.ts",
      "project/format/types/FormatInput.ts",
      "project/presets/types/TraitsInput.ts",
      "project/structure/types/AliasesInput.ts",
      "project/structure/types/DomainInput.ts",
      "project/structure/types/EffectsInput.ts",
      "project/structure/types/InlineRoleInput.ts",
      "project/structure/types/NamespaceInput.ts",
      "project/structure/types/RoleContractInput.ts",
      "project/structure/types/RolesInput.ts",
      "project/structure/types/RolesOptionInput.ts",
      "project/tsconfig/types/TypescriptInput.ts",
      "tools/agents/types/AgentsInput.ts",
      "tools/git/types/GitInput.ts",
      "tools/github/types/GithubInput.ts",
      "tools/prettier/types/PrettierInput.ts",
      "tools/vscode/types/VscodeInput.ts",
      "workflows/config/types/ConfigInput.ts",
    ],
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
