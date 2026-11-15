import { prettier, prettierPluginEntry } from "#tools/prettier/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `prettier` is installed; owns the `prettier.plugins` slot, the
 * `prettier` config key and `.prettierignore`, formats files, runs Prettier in
 * the gate and syncs `.prettierignore`.
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
    "sync.targets": [
      {
        name: "prettierignore",
        stage: "write",
        reads: ["tsconfig"],
        load() {
          return import("#tools/prettier/setup/syncPrettierignoreFile");
        },
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
