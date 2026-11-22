import {
  claudeFile,
  claudeSettingsFile,
  claudeTarget,
  wordBudgetsFile,
} from "#tools/metalbrain/claude/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `CLAUDE.md`, `.claude/settings.json` and `.engrenage/word-budgets.json`,
 * syncs Claude's settings and checks each role's word budget.
 */
export default {
  name: "tools/metalbrain/claude",
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
          } = await import("#tools/metalbrain/claude/setup/syncClaudeSettings");

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
          } = await import("#tools/metalbrain/claude/setup/checkWordBudgets");

          return checkWordBudgets;
        },
      },
    ],
  },
} satisfies Extension;
