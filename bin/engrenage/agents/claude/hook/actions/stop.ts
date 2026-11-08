import { object, string } from "valibot";

import { readHookPayload } from "#tools/agents/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { checkAgentStop } from "#workflows/gate/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  cwd: string(),
});

export default async function (): Promise<void> {
  const {
    session_id: session,
    agent_id: agent,
    cwd,
  } = await readHookPayload(payloadSchema, "Claude Code");

  const config = await loadValidatedConfig(cwd);

  const reason = await checkAgentStop(config, {
    runtime: "claude",
    session,
    agent,
  });

  if (!(reason !== undefined)) {
    return;
  }

  process.stderr.write(reason);

  process.exitCode = 2;
}
