import { prettier, prettierPluginEntry } from "#tools/prettier/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `prettier` is installed; owns the `prettier.plugins` slot, the
 * `prettier` config key and `.prettierignore`, formats files, runs Prettier in
 * the gate and contributes `.prettierignore` to `ignore.files`, whose `@ignore`
 * blocks the `blocks` target fills.
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
        input: "prettier",
        load() {
          return import("#tools/prettier/config/sections/prettierSection");
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
    "format.formatters": [
      {
        name: prettier,
        package: prettier,
        load() {
          return import("#tools/prettier/adapters/formatWithPrettier");
        },
      },
    ],
    "gate.steps": [
      // @debt the only lint verdict is `eslint --fix`, which runs before `prettier --write` rewrites the files, so a formatting change that breaks a lint rule passes the gate
      {
        name: prettier,
        stage: "fixes",
        audience: "everyone",
        load() {
          return import("#tools/prettier/operations/fixWithPrettier");
        },
      },
    ],
    "ignore.files": [
      {
        name: "prettierignore",
        load() {
          return import("#tools/prettier/operations/createPrettierignorePresets");
        },
      },
    ],
    "blocks.syntaxes": [
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
