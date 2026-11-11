import {
  barrelExportsEntry,
  barrelsTarget,
  typescript,
  typescriptExtensions,
} from "#tools/typescript/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/typescript",
  owns: {
    slots: {
      "barrels.exports": { entry: barrelExportsEntry },
    },
    files: {
      "cache.typescript": {
        title: "Cache",
        committed: false,
        async locate(config): Promise<FileLocation> {
          const cache = await config.resolve("cache");

          return { directory: cache.for(typescript) };
        },
      },
      "typescript.env": {
        title: "TypeScript",
        async locate(config): Promise<FileLocation | undefined> {
          const [{ types }, { envFile }] = await Promise.all([
            config.resolve("define"),
            config.resolve("typescript"),
          ]);

          return types ? { file: envFile } : undefined;
        },
      },
      "tsconfig.environments": {
        title: "TypeScript",
        async locate(config): Promise<FileLocation | undefined> {
          const {
            locateEnvironmentTsconfigs,
          } = await import("#tools/typescript/operations/locateEnvironmentTsconfigs");

          return locateEnvironmentTsconfigs(config);
        },
      },
      // @debt the barrels are located as literal paths passed as globs, so a path holding glob syntax (`[id]`) matches other files or none
      "typescript.barrels": {
        title: "TypeScript",
        async locate(config): Promise<FileLocation | undefined> {
          const {
            planBarrels,
          } = await import("#tools/typescript/operations/planBarrels");

          const plans = await planBarrels(config);

          return plans.length === 0
            ? undefined
            : { globs: plans.map(({ file }) => file) };
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
        extensions: typescriptExtensions,
        modules: true,
        declarations: ".d.ts",
      },
    ],
    "sync.targets": [
      {
        name: barrelsTarget,
        stage: "generate",
        produces: ["typescript.barrels"],
        async load() {
          const {
            syncBarrelFiles,
          } = await import("#tools/typescript/setup/syncBarrelFiles");

          return syncBarrelFiles;
        },
      },
      {
        name: "tsconfig",
        stage: "write",
        produces: ["tsconfig"],
        async load() {
          const {
            syncTsconfigFiles,
          } = await import("#tools/typescript/setup/syncTsconfigFiles");

          return syncTsconfigFiles;
        },
      },
      {
        name: "aliases",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json#imports", "tsconfig#paths"],
        async load() {
          const {
            syncAliases,
          } = await import("#tools/typescript/setup/syncAliases");

          return syncAliases;
        },
      },
      {
        name: "globals",
        stage: "write",
        reads: ["tsconfig"],
        async load() {
          const {
            syncEnvFile,
          } = await import("#tools/typescript/setup/syncEnvFile");

          return syncEnvFile;
        },
      },
      {
        name: "workspaces",
        stage: "write",
        reads: ["tsconfig"],
        async load() {
          const {
            syncWorkspaceFiles,
          } = await import("#tools/typescript/setup/syncWorkspaceFiles");

          return syncWorkspaceFiles;
        },
      },
    ],
  },
} satisfies Extension;
