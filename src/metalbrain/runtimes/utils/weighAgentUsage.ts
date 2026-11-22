import { tokenWeights } from "#metalbrain/runtimes/constants";
import type { AgentModelUsage } from "#metalbrain/runtimes/types/AgentModelUsage";

export function weighAgentUsage(entries: readonly AgentModelUsage[]): number {
  return entries.reduce((sum, { tokens }) => {
    return (
      sum +
      tokens.input * tokenWeights.input +
      tokens.cacheRead * tokenWeights.cacheRead +
      tokens.cacheWrite5m * tokenWeights.cacheWrite5m +
      tokens.cacheWrite1h * tokenWeights.cacheWrite1h +
      tokens.output * tokenWeights.output
    );
  }, 0);
}
