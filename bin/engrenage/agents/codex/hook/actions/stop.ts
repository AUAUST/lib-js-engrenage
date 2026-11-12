import { object, string } from "valibot";

import { resolveCodexProfile } from "#tools/agents/codex/index";
import { createAgentFillers, readHookPayload } from "#tools/agents/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { checkAgentStop } from "#workflows/gate/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  agent_type: string(),
  cwd: string(),
});

export default async function (): Promise<void> {
  const {
    session_id: session,
    agent_id: agent,
    agent_type: name,
    cwd,
  } = await readHookPayload(payloadSchema, "Codex");

  const config = await loadValidatedConfig(cwd);

  const profile = await resolveCodexProfile(
    {
      filesystem: config.context.filesystem,
      fillers: await createAgentFillers(config),
    },
    name,
  );

  if (profile?.gate !== true) {
    return;
  }

  const reason = await checkAgentStop(config, {
    runtime: "codex",
    session,
    agent,
  });

  if (reason === undefined) {
    return;
  }

  process.stderr.write(reason);

  process.exitCode = 2;
}
