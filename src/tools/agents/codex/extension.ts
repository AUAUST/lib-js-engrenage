import { codexFile, codexTarget } from "#tools/agents/codex/constants";
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
  contributes: {
    "agents.runtimes": [
      {
        name: "codex",
        title: "Codex",
      },
    ],
    "sync.targets": [
      {
        name: codexTarget,
        stage: "write",
        flags: {
          hooks: "create .codex/hooks.json when it is missing",
        },
        reads: ["agents.instructions"],
        async load() {
          const { syncCodexFiles } =
            await import("#tools/agents/codex/setup/syncCodexFiles");

          return syncCodexFiles;
        },
      },
    ],
  },
} satisfies Extension;

declare global {
  interface EngrenageAgentRuntimes {
    codex: true;
  }
}
