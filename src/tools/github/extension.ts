import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns the `github` config key and the workflow files, and syncs the workflows.
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
    },
  },
  contributes: {
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
