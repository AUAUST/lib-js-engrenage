import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/git",
  owns: {
    keys: {
      git: {
        input: "git",
        async load() {
          const {
            gitSection,
          } = await import("#tools/git/config/sections/gitSection");

          return gitSection;
        },
      },
    },
    files: {
      gitignore: {
        async locate(config): Promise<FileLocation | undefined> {
          const { gitignore } = await config.resolve("git");

          const file = await gitignore;

          return file === undefined ? undefined : { file };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "gitignore",
        stage: "write",
        reads: ["tsconfig"],
        produces: ["gitignore"],
        async load() {
          const {
            syncGitignoreFile,
          } = await import("#tools/git/setup/syncGitignoreFile");

          return syncGitignoreFile;
        },
      },
    ],
  },
} satisfies Extension;
