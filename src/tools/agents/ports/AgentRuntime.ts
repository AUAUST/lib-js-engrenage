import type { EntryShape } from "#foundation/extensions/index";

export interface AgentRuntime extends EntryShape {
  readonly name: string;
  readonly title?: string;
}

declare global {
  interface EngrenageSlots {
    "agents.runtimes": AgentRuntime;
  }

  interface EngrenageAgentRuntimes {}
}
