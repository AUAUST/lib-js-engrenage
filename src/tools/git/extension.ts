import { ignoreFileEntry } from "#tools/git/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Owns the `ignore.files` slot, the `git` config key, `.gitignore` and the
 * `ignore` directive, through which the `blocks` target fills the `@ignore`
 * blocks of every contributed ignore file, `.gitignore` included.
 */
export default {
  name: "tools/git",
  owns: {
    slots: {
      "ignore.files": { entry: ignoreFileEntry },
    },
    keys: {
      git: {
        input: "git",
        load() {
          return import("#tools/git/config/sections/gitSection");
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
    directives: {
      ignore: {
        async files(config): Promise<readonly File[]> {
          const {
            listIgnoreFiles,
          } = await import("#tools/git/operations/listIgnoreFiles");

          return listIgnoreFiles(config);
        },
        load() {
          return import("#tools/git/operations/fillIgnoreBlock");
        },
      },
    },
  },
  contributes: {
    "ignore.files": [
      {
        name: "gitignore",
        load() {
          return import("#tools/git/operations/createGitignorePresets");
        },
      },
    ],
    "blocks.syntaxes": [
      {
        name: "gitignore",
        files: ["**/.gitignore"],
        open: "# ",
        close: "",
        padding: "\n\n",
      },
    ],
  },
} satisfies Extension;
