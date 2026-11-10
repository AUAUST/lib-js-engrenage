import { packageJsonFile } from "#project/package/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "project/package",
  owns: {
    keys: {
      environment: {
        async load() {
          const {
            environmentSection,
          } = await import("#project/package/config/sections/environmentSection");

          return environmentSection;
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
