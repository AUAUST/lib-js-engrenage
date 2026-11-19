import { object, string } from "valibot";

import { readHookPayload, startAgentRun } from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  agent_type: string(),
});

export default async function (): Promise<void> {
  const {
    session_id: session,
    agent_id: agent,
    agent_type: role,
  } = await readHookPayload(payloadSchema, "Claude Code");

  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  await startAgentRun(resources.path("agents.stats"), {
    session,
    agent,
    role,
  });
}
