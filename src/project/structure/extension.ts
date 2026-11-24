import { layoutEntry, projectMapRule } from "#project/structure/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `layouts` slot and the `structure`, `structure.options`,
 * `structure.context`, `aliases`, `aliases.scopes`, `effectModules`, `entities`,
 * `environmentRoles`, `files`, `importGrants`, `importResolver` and `src.exports`
 * config keys. Contributes the project map and environment map agent fillers, the
 * project map rule files, the `batiment map --check` gate step run for agents
 * only, and the `commands` and `mirror` layouts.
 */
export default {
  name: "project/structure",
  owns: {
    slots: {
      layouts: { entry: layoutEntry, cardinality: "one" },
    },
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
      "structure.context": {
        async load() {
          const {
            contextSection,
          } = await import("#project/structure/config/sections/contextSection");

          return contextSection;
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
      "aliases.scopes": {
        input: "aliases",
        async load() {
          const {
            aliasScopesSection,
          } = await import("#project/structure/config/sections/aliasScopesSection");

          return aliasScopesSection;
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
    "layouts": [
      {
        name: "commands",
        async load() {
          const {
            commands,
          } = await import("#project/structure/presets/commands");

          return commands;
        },
      },
      {
        name: "mirror",
        async load() {
          const { mirror } = await import("#project/structure/presets/mirror");

          return mirror;
        },
      },
    ],
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
        name: "batiment map --check",
        stage: "checks",
        audience: "agents",
        async load() {
          const {
            runStructureCheck,
          } = await import("#project/structure/operations/runStructureCheck");

          return runStructureCheck;
        },
        check: {
          async load() {
            const {
              runStructureCheck,
            } = await import("#project/structure/operations/runStructureCheck");

            return runStructureCheck;
          },
        },
      },
    ],
  },
} satisfies Extension;
