import type { Agent } from "#metalbrain/runtimes/types/Agent";

export interface AgentCheckFinding {
  readonly agent: Agent;
  readonly status:
    | "configured"
    | "disabled"
    | "conflicting"
    | "unsupported"
    | "runtime-unverified";
  readonly message: string;
}
