import { prettier, prettierPluginEntry } from "#tools/prettier/constants";
import type { Extension, FileLocation } from "#project/config/index";

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
        audience: "agents",
        async load() {
          const {
            fixWithPrettier,
          } = await import("#tools/prettier/operations/fixWithPrettier");

          return fixWithPrettier;
        },
      },
    ],
    "sync.targets": [
      {
        name: "prettierignore",
        stage: "write",
        reads: ["tsconfig"],
        async load() {
          const {
            syncPrettierignoreFile,
          } = await import("#tools/prettier/setup/syncPrettierignoreFile");

          return syncPrettierignoreFile;
        },
      },
    ],
  },
} satisfies Extension;

declare global {
  interface EngrenageFormatters {
    prettier: true;
  }
}
