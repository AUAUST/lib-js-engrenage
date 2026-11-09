import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "project/build",
  owns: {
    keys: {
      "build": {
        input: "build",
        async load() {
          const { buildSection } =
            await import("#project/build/config/sections/buildSection");

          return buildSection;
        },
      },
      "build.outDir": {
        input: "build",
        async load() {
          const { buildOutDirSection } =
            await import("#project/build/config/sections/buildOutDirSection");

          return buildOutDirSection;
        },
      },
    },
    files: {
      "build.outDir": {
        title: "Output",
        committed: false,
        async locate(config): Promise<FileLocation | undefined> {
          const directory = await config.resolve("build.outDir");

          return directory === undefined ? undefined : { directory };
        },
      },
    },
  },
} satisfies Extension;
