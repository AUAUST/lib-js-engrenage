import { looseObject, optional, string } from "valibot";

import {
  resolveHookDirectory,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import { findOutputOverrun, validateHookPayload } from "#tools/agents/index";

const payloadSchema = looseObject({
  cwd: string(),
  tool_response: looseObject({
    stdout: optional(string(), ""),
    stderr: optional(string(), ""),
  }),
});

/**
 * PostToolUse on Bash: notices a shell output past `agents.outputLimit`.
 */
export async function limitClaudeOutput(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    cwd,
    tool_response: { stdout, stderr },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd));

  const { outputLimit } = await config.resolve("agents");

  const context = findOutputOverrun(`${stdout}${stderr}`, outputLimit);

  return context === undefined ? undefined : { decision: "context", context };
}
