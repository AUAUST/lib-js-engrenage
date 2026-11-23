import { looseObject, optional, string } from "valibot";

import {
  getSkillDefinitions,
  mainAgent,
  resolveHookDirectory,
  validateHookPayload,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig, type LoadedConfig } from "#project/config/index";
import { loadMetalbrainFacts } from "#tools/metalbrain/index";
import { checkAgentStop } from "#workflows/gate/operations/checkAgentStop";

const payloadSchema = looseObject({
  session_id: string(),
  agent_id: optional(string()),
  agent_type: optional(string()),
  cwd: string(),
});

async function isGatedAgent(
  config: LoadedConfig,
  name: string,
): Promise<boolean> {
  const { fragments } = await loadMetalbrainFacts(config);

  const definitions = await getSkillDefinitions({ fragments });

  return definitions.some(({ agent }) => {
    return agent?.name === name && agent.gate === true;
  });
}

/**
 * Stop and SubagentStop from a gated agent's frontmatter: refuses the agent's
 * first stop on a tree failing the worktree gate. A main session stops freely
 * unless it runs a gated agent.
 */
export async function gateClaudeStop(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    session_id: session,
    agent_id: agent,
    agent_type: role,
    cwd,
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  if (agent === undefined && role === undefined) {
    return;
  }

  const config = await loadValidatedConfig(resolveHookDirectory(cwd));

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

  return reason === undefined ? undefined : { decision: "deny", reason };
}
