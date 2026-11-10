import { object, optional, picklist, string } from "valibot";

import { resolveCodexProfile } from "#tools/agents/codex/index";
import {
  checkAgentDispatch,
  denyToolUse,
  readHookPayload,
} from "#tools/agents/index";
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

export default async function (): Promise<void> {
  const {
    cwd,
    tool_input: input,
  } = await readHookPayload(payloadSchema, "Codex");

  const config = await loadValidatedConfig(cwd);

  const profile = await resolveCodexProfile(
    config.context.filesystem,
    input.agent_type ?? input.subagent_type ?? "default",
  );

  if (!profile?.gate) {
    return;
  }

  const reason = await checkAgentDispatch(
    profile.role,
    input.message ?? input.prompt ?? "",
    cwd,
  );

  if (reason !== undefined) {
    denyToolUse(reason);
  }
}
