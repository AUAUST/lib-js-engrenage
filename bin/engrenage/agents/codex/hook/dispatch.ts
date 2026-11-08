import { object, optional, picklist, string } from "valibot";

import { resolveCodexProfile } from "#tools/agents/codex/index";
import { checkAgentDispatch } from "#tools/agents/operations/checkAgentDispatch";
import { denyToolUse } from "#tools/agents/operations/denyToolUse";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

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

export const dispatch = defineLegacyCommand((command) => {
  return command.action(async () => {
    const { cwd, tool_input: input } = await readHookPayload(
      payloadSchema,
      "Codex",
    );

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
    );

    if (reason !== undefined) {
      denyToolUse(reason);
    }
  });
});
