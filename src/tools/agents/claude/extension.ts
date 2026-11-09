import { claudeTarget } from "#tools/agents/claude/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "tools/agents/claude",
  contributes: {
    "sync.targets": [
      {
        name: claudeTarget,
        stage: "write",
        flags: {
          settings: "create .claude/settings.json when it is missing",
        },
        async load() {
          const { syncClaudeSettings } =
            await import("#tools/agents/claude/setup/syncClaudeSettings");

          return syncClaudeSettings;
        },
      },
    ],
  },
} satisfies Extension;
