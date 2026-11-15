import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `typescript`, `typescript.options`, `tsconfig` and `tsconfigPath`
 * config keys and the tsconfig file, whose parts sync targets write, located
 * only when a tsconfig path resolves.
 */
export default {
  name: "project/tsconfig",
  owns: {
    keys: {
      "typescript": {
        load() {
          return import("#project/tsconfig/config/sections/typescriptSection");
        },
      },
      "typescript.options": {
        input: "typescript",
        load() {
          return import("#project/tsconfig/config/sections/typescriptOptionsSection");
        },
      },
      "tsconfig": {
        load() {
          return import("#project/tsconfig/config/sections/tsconfigSection");
        },
      },
      "tsconfigPath": {
        load() {
          return import("#project/tsconfig/config/sections/tsconfigPathSection");
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
