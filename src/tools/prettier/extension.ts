import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/prettier",
  owns: {
    keys: {
      prettier: {
        input: "prettier",
        async load() {
          const { prettierSection } =
            await import("#tools/prettier/config/sections/prettierSection");

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
        name: "prettierignore",
        stage: "write",
        reads: ["tsconfig"],
        async load() {
          const { syncPrettierignoreFile } =
            await import("#tools/prettier/setup/syncPrettierignoreFile");

          return syncPrettierignoreFile;
        },
      },
    ],
  },
} satisfies Extension;
