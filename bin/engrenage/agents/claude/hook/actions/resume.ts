import { object, string } from "valibot";

import {
  checkAgentResume,
  denyToolUse,
  readHookPayload,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  session_id: string(),
  tool_input: object({
    to: string(),
  }),
});

export default async function (): Promise<void> {
  const {
    session_id: session,
    tool_input: { to: recipient },
  } = await readHookPayload(payloadSchema, "Claude Code");

  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
  );

  const reason = await checkAgentResume(config, { session, recipient });

  if (reason !== undefined) {
    denyToolUse(reason);
  }
}
