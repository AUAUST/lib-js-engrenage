import { lockfile } from "#tools/pnpm/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/pnpm",
  owns: {
    files: {
      "pnpm-lock.yaml": {
        title: "pnpm",
        formatted: false,
        async locate(): Promise<FileLocation> {
          return { file: lockfile };
        },
      },
    },
  },
} satisfies Extension;
