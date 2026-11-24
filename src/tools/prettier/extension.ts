import { prettier, prettierPluginEntry } from "#tools/prettier/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `prettier` is installed; owns the `prettier.plugins` slot, points
 * the `package.json` `prettier` key at the ready-made config, the `prettier`
 * config key and `.prettierignore`, formats files, runs Prettier in the gate
 * and contributes `.prettierignore` to `ignore.files`, whose `@ignore` blocks
 * the `blocks` target fills.
 */
export default {
  name: "tools/prettier",
  when: {
    installed: prettier,
  },
  owns: {
    slots: {
      "prettier.plugins": { entry: prettierPluginEntry },
    },
    keys: {
      prettier: {
        scope: "project",
        input: "prettier",
        async load() {
          const {
            prettierSection,
          } = await import("#tools/prettier/config/sections/prettierSection");

          return prettierSection;
        },
      },
    },
    files: {
      prettierignore: {
        async locate(config): Promise<FileLocation | undefined> {
          const { prettierignore } = await config.resolve("prettier");

          const file = await prettierignore;

          return file === undefined ? undefined : { file };
        },
      },
    },
  },
  contributes: {
    "sync.targets": [
      {
        name: "prettier",
        stage: "write",
        async load() {
          const {
            syncPrettierPreset,
          } = await import("#tools/prettier/setup/syncPrettierPreset");

          return syncPrettierPreset;
        },
      },
    ],
    "format.formatters": [
      {
        name: prettier,
        package: prettier,
        async load() {
          const {
            formatWithPrettier,
          } = await import("#tools/prettier/adapters/formatWithPrettier");

          return formatWithPrettier;
        },
      },
    ],
    "gate.steps": [
      // @debt the only lint verdict is `eslint --fix`, which runs before `prettier --write` rewrites the files, so a formatting change that breaks a lint rule passes the gate
      {
        name: prettier,
        stage: "fixes",
        audience: "everyone",
        async load() {
          const {
            fixWithPrettier,
          } = await import("#tools/prettier/operations/fixWithPrettier");

          return fixWithPrettier;
        },
        check: {
          async load() {
            const {
              checkWithPrettier,
            } = await import("#tools/prettier/operations/checkWithPrettier");

            return checkWithPrettier;
          },
        },
      },
    ],
    "ignore.files": [
      // @debt repeats the hash-comment syntax tools/git declares as `hashBlocks`; one shared ignore-file syntax would own it
      {
        name: "prettierignore",
        async load() {
          const {
            createPrettierignorePresets,
          } = await import("#tools/prettier/operations/createPrettierignorePresets");

          return createPrettierignorePresets;
        },
      },
    ],
    "blocks.syntaxes": [
      // @debt repeats the hash-comment syntax tools/git declares as `hashBlocks`; one shared ignore-file syntax would own it
      {
        name: "prettierignore",
        files: ["**/.prettierignore"],
        open: "# ",
        close: "",
        padding: "\n\n",
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface Formatters {
      prettier: true;
    }
  }
}
