import { projectMapRule } from "#project/structure/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `structure`, `structure.options`, `aliases`, `effectModules`,
 * `entities`, `environmentRoles`, `files`, `importGrants`, `importResolver` and
 * `src.exports` config keys. Contributes the project map and environment map
 * agent fillers, the project map rule files, and the `structure --check` gate
 * step run for agents only.
 */
export default {
  name: "project/structure",
  owns: {
    keys: {
      "structure": {
        async load() {
          const {
            structureSection,
          } = await import("#project/structure/config/sections/structureSection");

          return structureSection;
        },
      },
      "structure.options": {
        input: "structure",
        async load() {
          const {
            structureOptionsSection,
          } = await import("#project/structure/config/sections/structureOptionsSection");

          return structureOptionsSection;
        },
      },
      "aliases": {
        input: "aliases",
        async load() {
          const {
            aliasesSection,
          } = await import("#project/structure/config/sections/aliasesSection");

          return aliasesSection;
        },
      },
      "effectModules": {
        async load() {
          const {
            effectModulesSection,
          } = await import("#project/structure/config/sections/effectModulesSection");

          return effectModulesSection;
        },
      },
      "entities": {
        async load() {
          const {
            entitiesSection,
          } = await import("#project/structure/config/sections/entitiesSection");

          return entitiesSection;
        },
      },
      "environmentRoles": {
        async load() {
          const {
            environmentRolesSection,
          } = await import("#project/structure/config/sections/environmentRolesSection");

          return environmentRolesSection;
        },
      },
      "files": {
        async load() {
          const {
            filesSection,
          } = await import("#project/structure/config/sections/filesSection");

          return filesSection;
        },
      },
      "importGrants": {
        async load() {
          const {
            importGrantsSection,
          } = await import("#project/structure/config/sections/importGrantsSection");

          return importGrantsSection;
        },
      },
      "importResolver": {
        async load() {
          const {
            importResolverSection,
          } = await import("#project/structure/config/sections/importResolverSection");

          return importResolverSection;
        },
      },
      "src.exports": {
        async load() {
          const {
            sourceExportsSection,
          } = await import("#project/structure/config/sections/sourceExportsSection");

          return sourceExportsSection;
        },
      },
    },
  },
  contributes: {
    "agents.fillers": [
      {
        name: "project-map",
        async load() {
          const {
            fillProjectMap,
          } = await import("#project/structure/operations/fillProjectMap");

          return fillProjectMap;
        },
      },
      {
        name: "environment-map",
        async load() {
          const {
            fillEnvironmentMap,
          } = await import("#project/structure/operations/fillEnvironmentMap");

          return fillEnvironmentMap;
        },
      },
    ],
    "agents.rules": [
      {
        name: projectMapRule,
        async load() {
          const {
            generateProjectMapRules,
          } = await import("#project/structure/operations/generateProjectMapRules");

          return generateProjectMapRules;
        },
      },
    ],
    "gate.steps": [
      {
        name: "structure --check",
        stage: "checks",
        audience: "agents",
        async load() {
          const {
            runStructureCheck,
          } = await import("#project/structure/operations/runStructureCheck");

          return runStructureCheck;
        },
      },
    ],
  },
} satisfies Extension;
