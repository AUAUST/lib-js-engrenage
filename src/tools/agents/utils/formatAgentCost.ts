import type { AgentPrice } from "#tools/agents/types/AgentPrice";

export function formatAgentCost({ cost, unpriced }: AgentPrice): string {
  return unpriced.length > 0 ? "?" : `$${cost.toFixed(2)}`;
}
