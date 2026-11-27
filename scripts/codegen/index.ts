import { argument, command, option, program } from "#nexus/cli/index";
import { apiSourceLibrary } from "#project/baseline/constants";

export default program({
  root: command({
    name: "codegen",
    description: "Generate sources of the package from its tooling, running every generator without a subcommand.",
    options: [
      option({
        name: "check",
        type: "boolean",
        description: "report outdated files without writing them",
        default: false,
      }),
    ],
    subcommands: [
      command({
        name: "editions",
        description: "Generate the ES editions of TypeScript with the Baseline date of each of their libs from web-features.",
        options: [
          option({
            name: "check",
            type: "boolean",
            description: "report an outdated file without writing it",
            default: false,
          }),
        ],
        action() {
          return import("#scripts/codegen/actions/editions");
        },
      }),
      command({
        name: "apis",
        description: `Generate the execution API declaration groups from the ${apiSourceLibrary} of TypeScript.`,
        arguments: [
          argument({
            name: "groups",
            description: "groups to generate (all by default)",
            optional: true,
            variadic: true,
          }),
        ],
        options: [
          option({
            name: "check",
            type: "boolean",
            description: "report outdated groups without writing them",
            default: false,
          }),
        ],
        action() {
          return import("#scripts/codegen/actions/apis");
        },
      }),
      command({
        name: "config",
        description: "Generate `ConfigInput` and the documented config input interfaces from the descriptions of the config schemas.",
        options: [
          option({
            name: "check",
            type: "boolean",
            description: "report an outdated file without writing it",
            default: false,
          }),
        ],
        action() {
          return import("#scripts/codegen/actions/config");
        },
      }),
      command({
        name: "rules",
        description: "Generate the typed ESLint rules interfaces from the plugins the shipped configuration registers.",
        options: [
          option({
            name: "check",
            type: "boolean",
            description: "report outdated files without writing them",
            default: false,
          }),
        ],
        action() {
          return import("#scripts/codegen/actions/rules");
        },
      }),
      command({
        name: "schemas",
        description: "Generate the JSON Schemas of the structure metadata files from their validation schemas.",
        options: [
          option({
            name: "check",
            type: "boolean",
            description: "report an outdated file without writing it",
            default: false,
          }),
        ],
        action() {
          return import("#scripts/codegen/actions/schemas");
        },
      }),
    ],
    action() {
      return import("#scripts/codegen/actions/all");
    },
  }),
});
