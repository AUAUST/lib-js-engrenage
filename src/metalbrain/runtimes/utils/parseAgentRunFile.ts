import { basename } from "node:path";

import { agentRunExtensions } from "#metalbrain/runtimes/constants";
import type { AgentRunState } from "#metalbrain/runtimes/types/AgentRunState";

export function parseAgentRunFile(
  path: string,
  state: AgentRunState,
): string | undefined {
  const name = basename(path);

  const extension = agentRunExtensions[state];

  if (!name.endsWith(extension)) {
    return;
  }

  const agent = name.slice(0, -extension.length);

  return agent === "" || agent.includes(".") ? undefined : agent;
}
