import type { Extension } from "#project/config/index";

export default {
  name: "workflows/sync",
  contributes: {
    "sync.targets": [
      {
        name: "package",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json"],
        async load() {
          const { syncPackageJson } =
            await import("#workflows/sync/setup/syncPackageJson");

          return syncPackageJson;
        },
      },
      {
        name: "publishing",
        stage: "check",
        reads: ["package.json"],
        async load() {
          const { checkPublishing } =
            await import("#workflows/sync/setup/checkPublishing");

          return checkPublishing;
        },
      },
    ],
  },
} satisfies Extension;
