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
        load() {
          return import("#project/structure/config/sections/structureSection");
        },
      },
      "structure.options": {
        input: "structure",
        load() {
          return import("#project/structure/config/sections/structureOptionsSection");
        },
      },
      "aliases": {
        input: "aliases",
        load() {
          return import("#project/structure/config/sections/aliasesSection");
        },
      },
      "effectModules": {
        load() {
          return import("#project/structure/config/sections/effectModulesSection");
        },
      },
      "entities": {
        load() {
          return import("#project/structure/config/sections/entitiesSection");
        },
      },
      "environmentRoles": {
        load() {
          return import("#project/structure/config/sections/environmentRolesSection");
        },
      },
      "files": {
        load() {
          return import("#project/structure/config/sections/filesSection");
        },
      },
      "importGrants": {
        load() {
          return import("#project/structure/config/sections/importGrantsSection");
        },
      },
      "importResolver": {
        load() {
          return import("#project/structure/config/sections/importResolverSection");
        },
      },
      "src.exports": {
        load() {
          return import("#project/structure/config/sections/sourceExportsSection");
        },
      },
    },
  },
  contributes: {
    "agents.fillers": [
      {
        name: "project-map",
        load() {
          return import("#project/structure/operations/fillProjectMap");
        },
      },
      {
        name: "environment-map",
        load() {
          return import("#project/structure/operations/fillEnvironmentMap");
        },
      },
    ],
    "agents.rules": [
      {
        name: projectMapRule,
        load() {
          return import("#project/structure/operations/generateProjectMapRules");
        },
      },
    ],
    "gate.steps": [
      {
        name: "structure --check",
        stage: "checks",
        audience: "agents",
        load() {
          return import("#project/structure/operations/runStructureCheck");
        },
      },
    ],
  },
} satisfies Extension;
