import {
  claudeAgentsDir,
  claudeFile,
  claudeSettingsFile,
  claudeSkillsDir,
  claudeTarget,
} from "#tools/agents/claude/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `CLAUDE.md` and `.claude/settings.json`, registers the `claude` agent
 * runtime and syncs Claude's settings.
 */
export default {
  name: "tools/agents/claude",
  owns: {
    files: {
      "CLAUDE.md": {
        title: "Claude",
        locate(): FileLocation {
          return { file: claudeFile };
        },
      },
      "claude.settings": {
        title: "Claude",
        locate(): FileLocation {
          return { file: claudeSettingsFile };
        },
      },
    },
  },
  contributes: {
    "agents.runtimes": [
      {
        name: "claude",
        title: "Claude",
        skills: claudeSkillsDir,
        agents: claudeAgentsDir,
        dispatcher: {
          load() {
            return import("#tools/agents/claude/adapters/dispatchClaudeAgent");
          },
        },
      },
    ],
    "sync.targets": [
      {
        name: claudeTarget,
        stage: "write",
        flags: {
          settings: "create .claude/settings.json when it is missing",
        },
        load() {
          return import("#tools/agents/claude/setup/syncClaudeSettings");
        },
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface AgentRuntimes {
      claude: true;
    }
  }
}
