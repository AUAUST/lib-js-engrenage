import { githubSnapshotFile } from "#tools/github/constants";
import type { Extension, FileLocation } from "#project/config/index";

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
