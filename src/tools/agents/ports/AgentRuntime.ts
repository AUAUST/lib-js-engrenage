import type { EntryShape } from "#foundation/extensions/index";

export interface AgentRuntime extends EntryShape {
  readonly name: string;
  readonly title?: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.runtimes": AgentRuntime;
    }

    interface AgentRuntimes {}
  }
}
