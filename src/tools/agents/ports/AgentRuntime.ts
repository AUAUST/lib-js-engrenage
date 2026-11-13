import type { EntryShape } from "#foundation/extensions/index";

export interface AgentRuntime extends EntryShape {
  /**
   * Agent name `agents.preferred` accepts; declare it in `Engrenage.AgentRuntimes`
   * to type it.
   */
  readonly name: string;
  // @debt nothing reads `title`, so a runtime's display name has no effect
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
