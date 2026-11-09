import { defaultSuppressionsFile, eslint } from "#tools/eslint/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/eslint",
  when: { installed: eslint },
  owns: {
    files: {
      "eslint-suppressions.json": {
        title: "ESLint",
        formatted: false,
        async locate(): Promise<FileLocation> {
          return { file: defaultSuppressionsFile };
        },
      },
    },
  },
} satisfies Extension;
