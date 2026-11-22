import {
  claudeFile,
  claudeSettingsFile,
  claudeTarget,
  wordCapsFile,
} from "#tools/metalbrain/claude/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Owns `CLAUDE.md`, `.claude/settings.json` and `.engrenage/word-caps.json`,
 * syncs Claude's settings and checks each role's word cap.
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
      "state.wordCaps": {
        title: "Word caps",
        locate(): FileLocation {
          return { file: wordCapsFile };
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
        name: "word-caps",
        stage: "check",
        reads: ["agents.instructions"],
        async load() {
          const {
            checkWordCaps,
          } = await import("#tools/metalbrain/claude/setup/checkWordCaps");

          return checkWordCaps;
        },
      },
    ],
  },
} satisfies Extension;
