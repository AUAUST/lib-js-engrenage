import {
  barrelDirective,
  barrelExportsEntry,
  barrelsTarget,
  typescript,
  typescriptBlocks,
  typescriptExtensions,
} from "#tools/typescript/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Owns the `barrels.exports` slot, the `declarations` config key, the TypeScript
 * cache, env file, environment tsconfigs and barrels, contributes the TypeScript
 * language and block syntax, the `barrel` and `define` directives and the
 * TypeScript comment directives as line markers, and syncs barrels, tsconfigs,
 * aliases, globals and workspaces.
 */
export default {
  name: "tools/typescript",
  owns: {
    slots: {
      "barrels.exports": { entry: barrelExportsEntry },
    },
    keys: {
      declarations: {
        load() {
          return import("#tools/typescript/config/sections/declarationsSection");
        },
      },
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
    markers: {
      "ts-expect-error": true,
      "ts-ignore": true,
      "ts-nocheck": true,
      "ts-check": true,
    },
    directives: {
      [barrelDirective]: {
        async files(config): Promise<readonly File[]> {
          const {
            listBarrelCandidates,
          } = await import("#tools/typescript/operations/listBarrelCandidates");

          return listBarrelCandidates(config);
        },
        load() {
          return import("#tools/typescript/operations/fillBarrelBlock");
        },
      },
      define: {
        async files(config): Promise<readonly File[]> {
          const {
            listDefineFiles,
          } = await import("#tools/typescript/operations/listDefineFiles");

          return listDefineFiles(config);
        },
        load() {
          return import("#tools/typescript/operations/fillDefineBlock");
        },
      },
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
    "blocks.syntaxes": [
      {
        name: "typescript",
        files: typescriptExtensions.map((extension) => `**/*${extension}`),
        ...typescriptBlocks,
      },
    ],
    "sync.targets": [
      {
        name: barrelsTarget,
        stage: "generate",
        produces: ["typescript.barrels"],
        load() {
          return import("#tools/typescript/setup/syncBarrelFiles");
        },
      },
      {
        name: "tsconfig",
        stage: "write",
        produces: ["tsconfig"],
        load() {
          return import("#tools/typescript/setup/syncTsconfigFiles");
        },
      },
      {
        name: "aliases",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["package.json#imports", "tsconfig#paths"],
        load() {
          return import("#tools/typescript/setup/syncAliases");
        },
      },
      {
        name: "globals",
        stage: "write",
        reads: ["tsconfig"],
        load() {
          return import("#tools/typescript/setup/syncEnvFile");
        },
      },
      {
        name: "workspaces",
        stage: "write",
        reads: ["tsconfig"],
        load() {
          return import("#tools/typescript/setup/syncWorkspaceFiles");
        },
      },
    ],
  },
} satisfies Extension;
