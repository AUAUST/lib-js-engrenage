import { planningSheetRule } from "#tools/github/issues/planning/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the GitHub snapshot and generates the planning sheet rule while
 * `github.planning` is `true`.
 */
export default {
  name: "tools/github/issues/planning",
  when: {
    config: "github.planning",
  },
  owns: {
    files: {
      "state.github": {
        title: "GitHub snapshot",
        generated: true,
        async locate(): Promise<FileLocation> {
          const {
            locateGithubSnapshot,
          } = await import("#tools/github/issues/planning/operations/locateGithubSnapshot");

          return locateGithubSnapshot();
        },
      },
    },
  },
  contributes: {
    "agents.fillers": [
      {
        name: planningSheetRule,
        async load() {
          const {
            fillPlanningSheet,
          } = await import("#tools/github/issues/planning/operations/fillPlanningSheet");

          return fillPlanningSheet;
        },
      },
    ],
    "agents.rules": [
      {
        name: planningSheetRule,
        async load() {
          const {
            generatePlanningSheetRules,
          } = await import("#tools/github/issues/planning/operations/generatePlanningSheetRules");

          return generatePlanningSheetRules;
        },
      },
    ],
  },
} satisfies Extension;
