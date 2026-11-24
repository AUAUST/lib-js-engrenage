import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `github` config key and the workflow files, and syncs the workflows.
 */
export default {
  name: "tools/github",
  owns: {
    keys: {
      github: {
        scope: "project",
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
    },
  },
  contributes: {
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
