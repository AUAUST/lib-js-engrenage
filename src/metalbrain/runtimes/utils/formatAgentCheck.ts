import type { AgentCheckFinding } from "#metalbrain/runtimes/types/AgentCheckFinding";

export function formatAgentCheck({
  agent,
  status,
  message,
}: AgentCheckFinding): string {
  return `${agent} · ${status} · ${message}`;
}
