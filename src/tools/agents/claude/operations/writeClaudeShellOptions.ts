import { appendFile } from "node:fs/promises";

import { readTextFile } from "#foundation/filesystem/index";
import {
  claudeEnvFileVariable,
  claudeShellOptions,
} from "#tools/agents/claude/constants";

/**
 * Adds the shell options of Claude Code's Bash tool to the session environment
 * script Claude Code names in `CLAUDE_ENV_FILE` for SessionStart hooks, which it
 * runs before each Bash command of the session.
 */
export async function writeClaudeShellOptions(): Promise<void> {
  const file = process.env[claudeEnvFileVariable];

  if (file == null || file === "") {
    throw new Error(
      `${claudeEnvFileVariable} is unset: Claude Code sets it only for SessionStart hooks`,
    );
  }

  const script = (await readTextFile(file)) ?? "";

  if (script.split("\n").includes(claudeShellOptions)) {
    return;
  }

  await appendFile(file, `${claudeShellOptions}\n`);
}
