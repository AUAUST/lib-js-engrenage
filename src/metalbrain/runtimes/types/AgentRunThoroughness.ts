import type { ThoroughnessState } from "#metalbrain/runtimes/types/ThoroughnessState";

export type AgentRunThoroughness = Pick<
  ThoroughnessState,
  "level" | "limit" | "warnings"
>;
