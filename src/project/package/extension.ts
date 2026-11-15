import { packageJsonFile } from "#project/package/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `environment`, `packageJsonPath`, `packageJson` and `visibility`
 * config keys and the package manifest file, whose parts sync targets write.
 */
export default {
  name: "project/package",
  owns: {
    keys: {
      environment: {
        load() {
          return import("#project/package/config/sections/environmentSection");
        },
      },
      packageJsonPath: {
        load() {
          return import("#project/package/config/sections/packageJsonPathSection");
        },
      },
      packageJson: {
        load() {
          return import("#project/package/config/sections/packageJsonSection");
        },
      },
      visibility: {
        input: "visibility",
        load() {
          return import("#project/package/config/sections/visibilitySection");
        },
      },
    },
    files: {
      "package.json": {
        parts: true,
        locate(): FileLocation {
          return { file: packageJsonFile };
        },
      },
    },
  },
} satisfies Extension;
