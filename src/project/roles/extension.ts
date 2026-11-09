import { rolePresetEntry, rolePresetsEntry } from "#project/roles/constants";
import type { Extension } from "#project/config/index";

const codeEnvironments = ["src", "tests", "scripts", "tooling"];

const from = rolePresetsEntry;

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
        from,
        environments: codeEnvironments,
      },
      {
        name: "constants",
        from,
        environments: codeEnvironments,
      },
      {
        name: "declarations",
        from,
        environments: codeEnvironments,
      },
      {
        name: "types",
        from,
        environments: codeEnvironments,
      },
      {
        name: "utils",
        from,
        environments: codeEnvironments,
      },
      {
        name: "errors",
        from,
        environments: codeEnvironments,
      },
      {
        name: "enums",
        from,
        environments: codeEnvironments,
      },
      {
        name: "ports",
        from,
        environments: codeEnvironments,
      },
      {
        name: "adapters",
        from,
        environments: codeEnvironments,
      },
      {
        name: "fixtures",
        from,
        environments: ["tests"],
      },
      {
        name: "testsetup",
        from,
        environments: ["tests"],
      },
      {
        name: "entry",
        from,
        environments: ["src"],
        traits: ["published"],
      },
    ],
  },
} satisfies Extension;
