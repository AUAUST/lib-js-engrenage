import { looseObject, string } from "valibot";

import {
  resolveHookDirectory,
  validateHookPayload,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig, type LoadedConfig } from "#project/config/index";
import { MissingEslintError } from "#tools/eslint/errors/MissingEslintError";
import {
  formatInfoMessages,
  listInfoMessages,
  type InfoMessage,
} from "#tools/eslint/index";
import type { File } from "#types/File";

const payloadSchema = looseObject({
  cwd: string(),
  tool_input: looseObject({
    file_path: string(),
  }),
});

async function listEditMessages(
  config: LoadedConfig,
  file: File,
): Promise<readonly InfoMessage[]> {
  try {
    return await listInfoMessages(config, file);
  } catch (error) {
    if (error instanceof MissingEslintError) {
      return [];
    }

    throw error;
  }
}

/**
 * PostToolUse on Edit, MultiEdit and Write: suggests the info lint messages of
 * the edited file, nothing when the project lacks ESLint.
 */
export async function lintClaudeEdit(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    cwd,
    tool_input: { file_path: file },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd));

  const context = formatInfoMessages(
    file,
    await listEditMessages(config, file),
  );

  return context === undefined ? undefined : { decision: "context", context };
}
