/* eslint-disable auaust/max-lines */

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
    roles: [index(), entrypoint(), extension(), ...codeRoles],
    structure: {
      layers: ["foundation", "project", "tools", "workflows"],
      namespaces: {
        foundation: {
          purpose: "Primitives without project knowledge.",
          domains: {
            blocks: {
              internals: true,
              purpose: "Composable content blocks for generated files.",
            },
            data: {
              purpose: "Resolve files shipped with the package.",
            },
            extensions: {
              purpose:
                "Collect extensions, check their ownership and order their contributions.",
            },
            filesystem: {
              internals: true,
              purpose: "Read, stage and write project files.",
            },
            json: {
              purpose: "Read and edit JSON while preserving its formatting.",
            },
            options: {
              internals: true,
              purpose: "Declare and validate configuration options.",
            },
            processes: {
              purpose: "Run external processes.",
            },
          },
        },
        project: {
          purpose: "Tool-agnostic project models and contract domains.",
          layers: [
            "config",
            "baseline",
            "format",
            "presets",
            "roles",
            "steps",
            "sync",
            "gate",
            "cache",
            "tsconfig",
            "package",
            "environments",
            "build",
            "workspaces",
            "structure",
          ],
          domains: {
            baseline: {
              purpose:
                "Resolve browser support targets from Baseline editions.",
              domains: {
                editions: {
                  purpose: "Browser targets for each Baseline edition.",
                },
              },
            },
            build: {
              purpose:
                "Resolve build outputs and the emitted package manifest.",
            },
            cache: {
              purpose: "Cache directory of the project's tools.",
            },
            config: {
              purpose: "Load and resolve declarative configuration sections.",
            },
            environments: {
              purpose:
                "Configure source, tests, commands, tooling and data environments.",
            },
            format: {
              purpose: "Formatting contracts shared by tool adapters.",
            },
            package: {
              purpose: "Read and synchronize the project package manifest.",
            },
            gate: {
              purpose: "Contract of the steps the gate runs.",
            },
            presets: {
              purpose: "Project presets and their resolved traits.",
            },
            roles: {
              purpose: "Declare role contracts and presets.",
            },
            steps: {
              purpose:
                "Contracts and helpers for project initialization steps.",
            },
            structure: {
              purpose: "Resolve project structure and enforce its boundaries.",
            },
            sync: {
              purpose: "Run the sync targets and settle the files they change.",
            },
            tsconfig: {
              purpose: "Compose TypeScript project configurations.",
            },
            workspaces: {
              purpose: "Resolve workspace groups and their projects.",
            },
          },
        },
        tools: {
          purpose: "One domain per external tool, holding its adapters.",
          domains: {
            agents: {
              purpose:
                "Generate shared agent instructions, skills and project maps.",
              domains: {
                claude: {
                  purpose: "Configure Claude instructions, settings and hooks.",
                },
                codex: {
                  purpose:
                    "Configure Codex instructions, profiles, skills and hooks.",
                },
              },
            },
            changesets: {
              purpose: "Configure release versioning and changelogs.",
            },
            eslint: {
              purpose: "Configure lint rules and project-aware checks.",
              domains: {
                roles: {
                  purpose:
                    "Role presets carrying ESLint rules, loadable without ESLint.",
                },
              },
            },
            git: {
              purpose: "Configure Git conventions and repository files.",
            },
            github: {
              purpose: "Generate GitHub repository workflows.",
            },
            jscpd: {
              purpose: "Detect duplicate code.",
            },
            lefthook: {
              purpose: "Configure local Git hooks.",
            },
            pnpm: {
              purpose: "Configure package management and dependency policies.",
            },
            prettier: {
              purpose: "Configure code formatting.",
            },
            shopify: {
              purpose: "Configure Shopify apps and themes.",
              domains: {
                theme: {
                  purpose: "Format and ignore Shopify theme files.",
                },
              },
            },
            tsdown: {
              purpose: "Configure package bundling and packaging validation.",
            },
            typescript: {
              purpose: "Configure and run TypeScript checks.",
              domains: {
                tsc: {
                  purpose: "Run the TypeScript compiler.",
                },
              },
            },
            vite: {
              purpose: "Configure application builds and development servers.",
            },
            vitest: {
              purpose: "Configure and run source and distribution tests.",
            },
            vscode: {
              purpose:
                "Configure editor settings and extension recommendations.",
            },
          },
        },
        workflows: {
          purpose: "Composition of tools into the config and commands.",
          domains: {
            builtins: {
              purpose: "List every built-in extension.",
            },
            cli: {
              purpose:
                "Compose command definitions and their execution context.",
            },
            config: {
              purpose:
                "Compose and validate the complete project configuration.",
            },
            gate: {
              purpose: "Coordinate commit and agent verification gates.",
            },
            init: {
              purpose: "Initialize projects through ordered setup steps.",
            },
            sync: {
              purpose: "Sync the package manifest and check its publishing.",
            },
          },
        },
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
  bin: {
    structure: {
      domains: {
        engrenage: {
          purpose: "Project tooling commands.",
          domains: {
            agents: {
              purpose: "Agent lifecycle and instruction commands.",
              domains: {
                claude: {
                  purpose: "Claude lifecycle commands.",
                  domains: {
                    hook: {
                      purpose: "Handle Claude lifecycle hook events.",
                    },
                  },
                },
                codex: {
                  purpose: "Codex lifecycle commands.",
                  domains: {
                    hook: {
                      purpose: "Handle Codex lifecycle hook events.",
                    },
                  },
                },
                rules: {
                  purpose: "Install shared agent rules.",
                },
                skills: {
                  purpose: "Install shared agent skills.",
                },
              },
            },
            issues: {
              purpose: "Check GitHub issues against the issue contract.",
            },
            pnpm: {
              purpose: "Package manager maintenance commands.",
            },
          },
        },
      },
    },
  },
  scripts: {
    structure: {
      domains: {
        codegen: {
          purpose: "Generate source modules from authoritative definitions.",
        },
      },
    },
    roles: codeRoles,
  },
  tooling: {
    structure: {
      domains: {
        eslint: {
          purpose: "Repository-specific ESLint rules.",
        },
      },
    },
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
    },
  },
});
