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
        async load() {
          const { index } = await import("#project/roles/presets/index");

          return index;
        },
        environments: codeEnvironments,
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
      },
      {
        name: "types",
        async load() {
          const { types } = await import("#project/roles/presets/types");

          return types;
        },
        environments: codeEnvironments,
      },
      {
        name: "utils",
        async load() {
          const { utils } = await import("#project/roles/presets/utils");

          return utils;
        },
        environments: ["src", "scripts", "tooling"],
      },
      {
        name: "errors",
        async load() {
          const { errors } = await import("#project/roles/presets/errors");

          return errors;
        },
        environments: codeEnvironments,
      },
      {
        name: "enums",
        async load() {
          const { enums } = await import("#project/roles/presets/enums");

          return enums;
        },
        environments: codeEnvironments,
      },
      {
        name: "ports",
        async load() {
          const { ports } = await import("#project/roles/presets/ports");

          return ports;
        },
        environments: codeEnvironments,
      },
      {
        name: "adapters",
        async load() {
          const { adapters } = await import("#project/roles/presets/adapters");

          return adapters;
        },
        environments: codeEnvironments,
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
      },
      {
        name: "fixtures",
        async load() {
          const { fixtures } = await import("#project/roles/presets/fixtures");

          return fixtures;
        },
        environments: ["tests"],
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
        traits: ["published"],
      },
    ],
  },
} satisfies Extension;
