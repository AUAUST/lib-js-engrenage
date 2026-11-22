import { resolveWithin } from "#foundation/filesystem/index";
import { agentRunExtensions } from "#tools/agents/constants";
import type { AgentRunState } from "#metalbrain/runtimes/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function resolveAgentRunFile(
  directory: Directory,
  run: { session: string; agent: string },
  state: AgentRunState,
): File {
  if (run.agent.includes(".")) {
    throw new Error(
      `Invalid agent id "${run.agent}": a dot would make its run file ambiguous with the agent's other stats files`,
    );
  }

  return resolveWithin(
    directory,
    run.session,
    `${run.agent}${agentRunExtensions[state]}`,
  );
}
