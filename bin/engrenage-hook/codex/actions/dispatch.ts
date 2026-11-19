import { object, optional, picklist, string } from "valibot";

import { resolveCodexProfile } from "#tools/agents/codex/index";
import {
  checkAgentDispatch,
  denyToolUse,
  resolveHookDirectory,
  validateHookPayload,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  cwd: string(),
  tool_name: picklist(["spawn_agent", "Agent"]),
  tool_input: object({
    agent_type: optional(string()),
    subagent_type: optional(string()),
    message: optional(string()),
    prompt: optional(string()),
  }),
});

export default async function (payload: unknown): Promise<boolean> {
  const {
    cwd,
    tool_input: input,
  } = validateHookPayload(payloadSchema, payload, "Codex");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd), {
    reporter: getRunContext().reporter,
  });

  const profile = await resolveCodexProfile(
    config,
    input.agent_type ?? input.subagent_type ?? "default",
  );

  if (!profile?.gate) {
    return false;
  }

  const reason = await checkAgentDispatch(
    config,
    profile.role,
    input.message ?? input.prompt ?? "",
    config.context.root,
  );

  if (reason === undefined) {
    return false;
  }

  denyToolUse(reason);

  return true;
}
