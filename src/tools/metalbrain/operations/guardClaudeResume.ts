import { object, string } from "valibot";

import {
  resolveHookDirectory,
  resolveMainWorktree,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import { checkAgentResume, validateHookPayload } from "#tools/agents/index";

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

  const reason = await checkAgentResume(config, { session, recipient });

  return reason === undefined ? undefined : { decision: "deny", reason };
}
