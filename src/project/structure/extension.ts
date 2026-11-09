import type { Extension } from "#project/config/index";

export default {
  name: "project/structure",
  owns: {
    keys: {
      "structure": {
        async load() {
          const { structureSection } =
            await import("#project/structure/config/sections/structureSection");

          return structureSection;
        },
      },
      "structure.options": {
        input: "structure",
        async load() {
          const { structureOptionsSection } =
            await import("#project/structure/config/sections/structureOptionsSection");

          return structureOptionsSection;
        },
      },
      "aliases": {
        input: "aliases",
        async load() {
          const { aliasesSection } =
            await import("#project/structure/config/sections/aliasesSection");

          return aliasesSection;
        },
      },
      "effectModules": {
        async load() {
          const { effectModulesSection } =
            await import("#project/structure/config/sections/effectModulesSection");

          return effectModulesSection;
        },
      },
      "entities": {
        async load() {
          const { entitiesSection } =
            await import("#project/structure/config/sections/entitiesSection");

          return entitiesSection;
        },
      },
      "environmentRoles": {
        async load() {
          const { environmentRolesSection } =
            await import("#project/structure/config/sections/environmentRolesSection");

          return environmentRolesSection;
        },
      },
      "files": {
        async load() {
          const { filesSection } =
            await import("#project/structure/config/sections/filesSection");

          return filesSection;
        },
      },
      "importGrants": {
        async load() {
          const { importGrantsSection } =
            await import("#project/structure/config/sections/importGrantsSection");

          return importGrantsSection;
        },
      },
      "importResolver": {
        async load() {
          const { importResolverSection } =
            await import("#project/structure/config/sections/importResolverSection");

          return importResolverSection;
        },
      },
      "src.exports": {
        async load() {
          const { sourceExportsSection } =
            await import("#project/structure/config/sections/sourceExportsSection");

          return sourceExportsSection;
        },
      },
    },
  },
} satisfies Extension;
