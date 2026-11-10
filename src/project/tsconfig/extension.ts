import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "project/tsconfig",
  owns: {
    keys: {
      "typescript": {
        async load() {
          const {
            typescriptSection,
          } = await import("#project/tsconfig/config/sections/typescriptSection");

          return typescriptSection;
        },
      },
      "typescript.options": {
        input: "typescript",
        async load() {
          const {
            typescriptOptionsSection,
          } = await import("#project/tsconfig/config/sections/typescriptOptionsSection");

          return typescriptOptionsSection;
        },
      },
      "tsconfig": {
        async load() {
          const {
            tsconfigSection,
          } = await import("#project/tsconfig/config/sections/tsconfigSection");

          return tsconfigSection;
        },
      },
      "tsconfigPath": {
        async load() {
          const {
            tsconfigPathSection,
          } = await import("#project/tsconfig/config/sections/tsconfigPathSection");

          return tsconfigPathSection;
        },
      },
    },
    files: {
      tsconfig: {
        parts: true,
        async locate(config): Promise<FileLocation | undefined> {
          const file = await config.resolve("tsconfigPath");

          return file === undefined ? undefined : { file };
        },
      },
    },
  },
} satisfies Extension;
