import { object, string } from "valibot";

import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";
import { checkAgentStop } from "#workflows/gate/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: string(),
  cwd: string(),
});

export const stop = defineLegacyCommand((command) => {
  return command.action(async () => {
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
  });
});
