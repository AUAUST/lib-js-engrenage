import { object, optional, string } from "valibot";

import {
  resolveHookDirectory,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import { validateHookPayload } from "#tools/agents/index";
import { checkAgentDispatch } from "#tools/metalbrain/operations/checkAgentDispatch";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

/**
 * PreToolUse on Agent and Task: denies a dispatch whose brief or issue is not
 * ready for its agent.
 */
export async function guardClaudeDispatch(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    cwd,
    tool_input: { subagent_type: agent = "", prompt },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd));

  const reason = await checkAgentDispatch(
    config,
    agent,
    prompt,
    config.context.root,
  );

  return reason === undefined ? undefined : { decision: "deny", reason };
}
