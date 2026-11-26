import {
  barrelDirective,
  barrelExportsEntry,
  barrelsTarget,
  everyTypescriptExtension,
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
        scope: "project",
        async load() {
          const {
            declarationsSection,
          } = await import("#tools/typescript/config/sections/declarationsSection");

          return declarationsSection;
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
          const { types } = await config.resolve("define");

          if (!types) {
            return;
          }

          const {
            resolveSourceDeclarationsFile,
          } = await import("#tools/typescript/operations/resolveSourceDeclarationsFile");

          const file = await resolveSourceDeclarationsFile(config);

          return file === undefined ? undefined : { file };
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
            planScopeBarrels,
          } = await import("#tools/typescript/operations/planScopeBarrels");

          const plans = await planScopeBarrels(config);

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

          // @debt `@barrel` blocks fill against the root's structure only, so a workspace's blocks go unfilled
          return listBarrelCandidates(
            config.context.filesystem,
            await config.resolve("structure"),
          );
        },
        async load() {
          const {
            fillBarrelBlock,
          } = await import("#tools/typescript/operations/fillBarrelBlock");

          return fillBarrelBlock;
        },
      },
      define: {
        async files(config): Promise<readonly File[]> {
          const {
            listDefineFiles,
          } = await import("#tools/typescript/operations/listDefineFiles");

          return listDefineFiles(config);
        },
        async load() {
          const {
            fillDefineBlock,
          } = await import("#tools/typescript/operations/fillDefineBlock");

          return fillDefineBlock;
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
        async configure() {
          const {
            listTypescriptExtensions,
          } = await import("#tools/typescript/utils/listTypescriptExtensions");

          return listTypescriptExtensions;
        },
      },
    ],
    "blocks.syntaxes": [
      // @debt matches every extension TypeScript can take, not the covering environment's resolved list, as a block syntax's `files` are static globs
      {
        name: "typescript",
        files: everyTypescriptExtension.map((extension) => {
          return `**/*${extension}`;
        }),
        ...typescriptBlocks,
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
