import { rolePresetEntry } from "#project/roles/constants";
import type { Extension } from "#project/config/index";

const codeEnvironments = ["src", "tests", "scripts", "tooling"];
const typescript = ["typescript"];

/**
 * Owns the `roles` slot and contributes the generic role presets, each a default
 * role of the environment kinds it lists, for TypeScript.
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
        async load() {
          const { index } = await import("#project/roles/presets/index");

          return index;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "constants",
        async load() {
          const {
            constants,
          } = await import("#project/roles/presets/constants");

          return constants;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "declarations",
        async load() {
          const {
            declarations,
          } = await import("#project/roles/presets/declarations");

          return declarations;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "types",
        async load() {
          const { types } = await import("#project/roles/presets/types");

          return types;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "utils",
        async load() {
          const { utils } = await import("#project/roles/presets/utils");

          return utils;
        },
        environments: ["src", "scripts", "tooling"],
        languages: typescript,
      },
      {
        name: "errors",
        async load() {
          const { errors } = await import("#project/roles/presets/errors");

          return errors;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "enums",
        async load() {
          const { enums } = await import("#project/roles/presets/enums");

          return enums;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "ports",
        async load() {
          const { ports } = await import("#project/roles/presets/ports");

          return ports;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "adapters",
        async load() {
          const { adapters } = await import("#project/roles/presets/adapters");

          return adapters;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "operations",
        async load() {
          const {
            operations,
          } = await import("#project/roles/presets/operations");

          return operations;
        },
        environments: codeEnvironments,
        languages: typescript,
      },
      {
        name: "testutils",
        async load() {
          const {
            testutils,
          } = await import("#project/roles/presets/testutils");

          return testutils;
        },
        environments: ["tests"],
        languages: typescript,
      },
      {
        name: "fixtures",
        async load() {
          const { fixtures } = await import("#project/roles/presets/fixtures");

          return fixtures;
        },
        environments: ["tests"],
        languages: typescript,
      },
      {
        name: "testsetup",
        async load() {
          const {
            testsetup,
          } = await import("#project/roles/presets/testsetup");

          return testsetup;
        },
        environments: ["tests"],
        languages: typescript,
      },
      {
        name: "entrypoint",
        async load() {
          const {
            entrypoint,
          } = await import("#project/roles/presets/entrypoint");

          return entrypoint;
        },
        environments: ["src"],
        languages: typescript,
        traits: ["published"],
      },
    ],
  },
} satisfies Extension;
