import { object, string } from "valibot";

import { resolveWithin } from "#foundation/filesystem/index";
import {
  checkAgentResume,
  resolveHookDirectory,
  resolveMainWorktree,
  validateHookPayload,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import { loadInstructionRegistry } from "#tools/metalbrain/operations/loadInstructionRegistry";

const payloadSchema = object({
  cwd: string(),
  session_id: string(),
  tool_input: object({
    to: string(),
  }),
});

/**
 * PreToolUse on SendMessage: denies resuming a subagent past its
 * thoroughness ceiling.
 */
export async function guardClaudeResume(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    cwd,
    session_id: session,
    tool_input: { to: recipient },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(
    await resolveMainWorktree(resolveHookDirectory(cwd)),
  );

  const [resources, instructions] = await Promise.all([
    config.resolve("resources"),
    loadInstructionRegistry(config),
  ]);

  const reason = await checkAgentResume(
    {
      directory: resolveWithin(resources.path("agents.stats"), session),
      instructions,
    },
    recipient,
  );

  return reason === undefined ? undefined : { decision: "deny", reason };
}
