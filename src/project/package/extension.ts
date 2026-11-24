import { packageJsonFile } from "#project/package/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `dependencies`, `packageJsonPath`, `packageJson` and `visibility`
 * config keys and the package manifest file, whose parts sync targets write.
 */
export default {
  name: "project/package",
  owns: {
    keys: {
      dependencies: {
        async load() {
          const {
            dependenciesSection,
          } = await import("#project/package/config/sections/dependenciesSection");

          return dependenciesSection;
        },
      },
      packageJsonPath: {
        async load() {
          const {
            packageJsonPathSection,
          } = await import("#project/package/config/sections/packageJsonPathSection");

          return packageJsonPathSection;
        },
      },
      packageJson: {
        async load() {
          const {
            packageJsonSection,
          } = await import("#project/package/config/sections/packageJsonSection");

          return packageJsonSection;
        },
      },
      visibility: {
        scope: "project",
        input: "visibility",
        async load() {
          const {
            visibilitySection,
          } = await import("#project/package/config/sections/visibilitySection");

          return visibilitySection;
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
