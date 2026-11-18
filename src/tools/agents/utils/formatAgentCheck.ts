import type { AgentCheckFinding } from "#tools/agents/types/AgentCheckFinding";

export function formatAgentCheck({
  agent,
  status,
  message,
}: AgentCheckFinding): string {
  return `${agent} · ${status} · ${message}`;
}
