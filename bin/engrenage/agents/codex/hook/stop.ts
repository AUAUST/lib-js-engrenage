import { object, string } from "valibot";

import { resolveCodexProfile } from "#tools/agents/codex/index";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { checkAgentStop } from "#workflows/gate/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  agent_type: string(),
  cwd: string(),
});

export const stop = defineLegacyCommand((command) => {
  return command.action(async () => {
    const {
      session_id: session,
      agent_id: agent,
      agent_type: name,
      cwd,
    } = await readHookPayload(payloadSchema, "Codex");

    const config = await loadValidatedConfig(cwd);

    const profile = await resolveCodexProfile(config.context.filesystem, name);

    if (profile?.gate !== true) {
      return;
    }

    const reason = await checkAgentStop(config, {
      runtime: "codex",
      session,
      agent,
    });

    if (!(reason !== undefined)) {
      return;
    }

    process.stderr.write(reason);

    process.exitCode = 2;
  });
});
