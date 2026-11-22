import { object, optional, string } from "valibot";

import { denyToolUse } from "#metalbrain/runtimes/index";
import {
  checkAgentDispatch,
  resolveHookDirectory,
  validateHookPayload,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

export default async function (payload: unknown): Promise<boolean> {
  const {
    cwd,
    tool_input: { subagent_type: agent = "", prompt },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd), {
    reporter: getRunContext().reporter,
  });

  const reason = await checkAgentDispatch(
    config,
    agent,
    prompt,
    config.context.root,
  );

  if (reason === undefined) {
    return false;
  }

  denyToolUse(reason);

  return true;
}
