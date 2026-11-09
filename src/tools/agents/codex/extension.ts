import { codexFile } from "#tools/agents/codex/constants";
import type { Extension, FileLocation } from "#project/config/index";

export default {
  name: "tools/agents/codex",
  owns: {
    files: {
      "AGENTS.override.md": {
        title: "Codex",
        generated: true,
        async locate(config): Promise<FileLocation | undefined> {
          const { preferred } = await config.resolve("agents");

          return preferred?.includes("codex") === true
            ? { file: codexFile }
            : undefined;
        },
      },
    },
  },
} satisfies Extension;
