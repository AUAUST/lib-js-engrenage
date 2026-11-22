import {
  claudeAgentsDir,
  claudeFile,
  claudeSettingsFile,
  claudeSkillsDir,
  claudeTarget,
  wordBudgetsFile,
} from "#tools/agents/claude/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `CLAUDE.md`, `.claude/settings.json` and `.engrenage/word-budgets.json`,
 * registers the `claude` agent runtime, syncs Claude's settings and checks
 * each role's word budget.
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
      "state.wordBudgets": {
        title: "Word budgets",
        locate(): FileLocation {
          return { file: wordBudgetsFile };
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
          async load() {
            const {
              dispatchClaudeAgent,
            } = await import("#tools/agents/claude/adapters/dispatchClaudeAgent");

            return dispatchClaudeAgent;
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
        async load() {
          const {
            syncClaudeSettings,
          } = await import("#tools/agents/claude/setup/syncClaudeSettings");

          return syncClaudeSettings;
        },
      },
      {
        name: "word-budgets",
        stage: "check",
        reads: ["agents.instructions"],
        async load() {
          const {
            checkWordBudgets,
          } = await import("#tools/agents/claude/setup/checkWordBudgets");

          return checkWordBudgets;
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
