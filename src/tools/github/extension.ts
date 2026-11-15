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
        load() {
          return import("#tools/github/config/sections/githubSection");
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
        load() {
          return import("#tools/github/operations/fillPlanningSheet");
        },
      },
    ],
    "agents.rules": [
      {
        name: planningSheetRule,
        load() {
          return import("#tools/github/operations/generatePlanningSheetRules");
        },
      },
    ],
    "sync.targets": [
      {
        name: "workflows",
        stage: "write",
        load() {
          return import("#tools/github/setup/syncWorkflowFiles");
        },
      },
    ],
  },
} satisfies Extension;
