import { rolePresetEntry } from "#project/roles/constants";
import type { Extension } from "#project/config/index";

const codeEnvironments = ["src", "tests", "scripts", "tooling"];

/**
 * Owns the `roles` slot and contributes the generic role presets, each a default
 * role of the environments it lists.
 */
export default {
  name: "project/roles",
  owns: {
    slots: {
      roles: { entry: rolePresetEntry },
    },
  },
  contributes: {
    roles: [
      {
        name: "index",
        load() {
          return import("#project/roles/presets/index");
        },
        environments: codeEnvironments,
      },
      {
        name: "constants",
        load() {
          return import("#project/roles/presets/constants");
        },
        environments: codeEnvironments,
      },
      {
        name: "declarations",
        load() {
          return import("#project/roles/presets/declarations");
        },
        environments: codeEnvironments,
      },
      {
        name: "types",
        load() {
          return import("#project/roles/presets/types");
        },
        environments: codeEnvironments,
      },
      {
        name: "utils",
        load() {
          return import("#project/roles/presets/utils");
        },
        environments: ["src", "scripts", "tooling"],
      },
      {
        name: "errors",
        load() {
          return import("#project/roles/presets/errors");
        },
        environments: codeEnvironments,
      },
      {
        name: "enums",
        load() {
          return import("#project/roles/presets/enums");
        },
        environments: codeEnvironments,
      },
      {
        name: "ports",
        load() {
          return import("#project/roles/presets/ports");
        },
        environments: codeEnvironments,
      },
      {
        name: "adapters",
        load() {
          return import("#project/roles/presets/adapters");
        },
        environments: codeEnvironments,
      },
      {
        name: "operations",
        load() {
          return import("#project/roles/presets/operations");
        },
        environments: codeEnvironments,
      },
      {
        name: "testutils",
        load() {
          return import("#project/roles/presets/testutils");
        },
        environments: ["tests"],
      },
      {
        name: "fixtures",
        load() {
          return import("#project/roles/presets/fixtures");
        },
        environments: ["tests"],
      },
      {
        name: "testsetup",
        load() {
          return import("#project/roles/presets/testsetup");
        },
        environments: ["tests"],
      },
      {
        name: "entrypoint",
        load() {
          return import("#project/roles/presets/entrypoint");
        },
        environments: ["src"],
        traits: ["published"],
      },
    ],
  },
} satisfies Extension;
