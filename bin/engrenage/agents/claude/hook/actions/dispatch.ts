import { object, optional, string } from "valibot";

import {
  checkAgentDispatch,
  denyToolUse,
  readHookPayload,
} from "#tools/agents/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

export default async function (): Promise<void> {
  const {
    tool_input: { subagent_type: agent = "", prompt },
  } = await readHookPayload(payloadSchema, "Claude Code");

  const root = process.cwd();

  const config = await loadValidatedConfig(root);

  const { protocol } = await config.resolve("github");

  const reason = await checkAgentDispatch(agent, prompt, root, protocol);

  if (reason !== undefined) {
    denyToolUse(reason);
  }
}
