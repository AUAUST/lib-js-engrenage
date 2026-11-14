import { githubSnapshotFile, planningSheetRule } from "#tools/github/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `github` config key, the workflow files and the GitHub snapshot,
 * generates the planning sheet rule and syncs the workflows.
 */
export default {
  name: "tools/github",
  owns: {
    keys: {
      github: {
        input: "github",
        async load() {
          const {
            githubSection,
          } = await import("#tools/github/config/sections/githubSection");

          return githubSection;
        },
      },
    },
    files: {
      "github.workflows": {
        title: "GitHub",
        async locate(config): Promise<FileLocation | undefined> {
          const {
            locateWorkflowFiles,
          } = await import("#tools/github/operations/locateWorkflowFiles");

          return locateWorkflowFiles(config);
        },
      },
      "state.github": {
        title: "GitHub snapshot",
        generated: true,
        locate(): FileLocation {
          return { file: githubSnapshotFile };
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
          } = await import("#tools/github/operations/fillPlanningSheet");

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
          } = await import("#tools/github/operations/generatePlanningSheetRules");

          return generatePlanningSheetRules;
        },
      },
    ],
    "sync.targets": [
      {
        name: "workflows",
        stage: "write",
        async load() {
          const {
            syncWorkflowFiles,
          } = await import("#tools/github/setup/syncWorkflowFiles");

          return syncWorkflowFiles;
        },
      },
    ],
  },
} satisfies Extension;
