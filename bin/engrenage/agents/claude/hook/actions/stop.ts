import { object, optional, string } from "valibot";

import {
  getSkillDefinitions,
  listActiveExtensions,
  mainAgent,
  readHookPayload,
} from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { checkAgentStop } from "#workflows/gate/index";
import type { LoadedConfig } from "#project/config/index";

const payloadSchema = object({
  session_id: string(),
  agent_id: optional(string()),
  agent_type: optional(string()),
  cwd: string(),
});

async function isGatedAgent(
  config: LoadedConfig,
  name: string,
): Promise<boolean> {
  const definitions = await getSkillDefinitions({
    extensions: await listActiveExtensions(config),
  });

  return definitions.some(({ agent }) => {
    return agent?.name === name && agent.gate === true;
  });
}

export default async function (): Promise<void> {
  const {
    session_id: session,
    agent_id: agent,
    agent_type: role,
    cwd,
  } = await readHookPayload(payloadSchema, "Claude Code");

  if (agent === undefined && role === undefined) {
    return;
  }

  const config = await loadValidatedConfig(cwd, {
    reporter: getRunContext().reporter,
  });

  if (
    agent === undefined &&
    role !== undefined &&
    !(await isGatedAgent(config, role))
  ) {
    return;
  }

  const reason = await checkAgentStop(config, {
    runtime: "claude",
    session,
    agent: agent ?? mainAgent,
  });

  if (reason === undefined) {
    return;
  }

  process.stderr.write(reason);

  process.exitCode = 2;
}
