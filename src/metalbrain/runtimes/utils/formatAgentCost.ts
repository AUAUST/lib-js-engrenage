import type { AgentPrice } from "#metalbrain/runtimes/types/AgentPrice";

export function formatAgentCost({ cost, unpriced }: AgentPrice): string {
  return unpriced.length > 0 ? "?" : `$${cost.toFixed(2)}`;
}
