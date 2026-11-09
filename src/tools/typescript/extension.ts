import { typescript } from "#tools/typescript/constants";
import type { Extension, FileLocation } from "#project/config/index";

import tsc from "#tools/typescript/tsc/extension";

export default [
  {
    name: "tools/typescript",
    owns: {
      files: {
        "cache.typescript": {
          title: "Cache",
          committed: false,
          async locate(config): Promise<FileLocation> {
            const cache = await config.resolve("cache");

            return { directory: cache.for(typescript) };
          },
        },
      },
      parts: {
        "package.json#imports": true,
        "tsconfig#paths": true,
      },
    },
    contributes: {
      "languages": [
        {
          name: "typescript",
          extensions: [".ts", ".tsx", ".mts", ".cts"],
          modules: true,
          declarations: ".d.ts",
        },
      ],
      "sync.targets": [
        {
          name: "tsconfig",
          stage: "write",
          produces: ["tsconfig"],
          async load() {
            const { syncTsconfigFiles } =
              await import("#tools/typescript/setup/syncTsconfigFiles");

            return syncTsconfigFiles;
          },
        },
        {
          name: "aliases",
          stage: "write",
          reads: ["tsconfig"],
          produces: ["package.json#imports", "tsconfig#paths"],
          async load() {
            const { syncAliases } =
              await import("#tools/typescript/setup/syncAliases");

            return syncAliases;
          },
        },
        {
          name: "globals",
          stage: "write",
          reads: ["tsconfig"],
          async load() {
            const { syncEnvFile } =
              await import("#tools/typescript/setup/syncEnvFile");

            return syncEnvFile;
          },
        },
        {
          name: "workspaces",
          stage: "write",
          reads: ["tsconfig"],
          async load() {
            const { syncWorkspaceFiles } =
              await import("#tools/typescript/setup/syncWorkspaceFiles");

            return syncWorkspaceFiles;
          },
        },
      ],
    },
  },
  tsc,
] satisfies readonly Extension[];
