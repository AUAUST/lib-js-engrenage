import {
  gitattributesFile,
  hashBlocks,
  ignoreFileEntry,
} from "#tools/git/constants";
import type { Extension, FileLocation } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Owns the `ignore.files` slot, the `git` config key, `.gitignore`,
 * `.gitattributes`, the `ignore` directive, through which the `blocks` target
 * fills the `@ignore` blocks of every contributed ignore file, `.gitignore`
 * included, and the `attributes` directive, which fills the `@attributes` block
 * of `.gitattributes` from resource flags.
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
      gitattributes: {
        locate(): FileLocation {
          return { file: gitattributesFile };
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
        async load() {
          const {
            fillIgnoreBlock,
          } = await import("#tools/git/operations/fillIgnoreBlock");

          return fillIgnoreBlock;
        },
      },
      attributes: {
        files(): Promise<readonly File[]> {
          return Promise.resolve([gitattributesFile]);
        },
        async load() {
          const {
            fillAttributesBlock,
          } = await import("#tools/git/operations/fillAttributesBlock");

          return fillAttributesBlock;
        },
      },
    },
  },
  contributes: {
    "ignore.files": [
      {
        name: "gitignore",
        async load() {
          const {
            createGitignorePresets,
          } = await import("#tools/git/operations/createGitignorePresets");

          return createGitignorePresets;
        },
      },
    ],
    "blocks.syntaxes": [
      {
        name: "gitignore",
        files: ["**/.gitignore"],
        ...hashBlocks,
      },
      {
        name: "gitattributes",
        files: ["**/.gitattributes"],
        ...hashBlocks,
      },
    ],
  },
} satisfies Extension;
