import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { AgentDispatcher } from "#tools/agents/ports/AgentDispatcher";

export interface AgentRuntime extends EntryShape {
  /**
   * Agent name `agents.preferred` accepts; declare it in `Engrenage.AgentRuntimes`
   * to type it.
   */
  readonly name: string;
  /**
   * Display name in messages about the runtime, `name` when absent.
   */
  readonly title?: string;
  /**
   * Runs the runtime's agents headless; without it, `agents dispatch`
   * refuses the runtime.
   */
  readonly dispatcher?: Lazy<AgentDispatcher>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.runtimes": AgentRuntime;
    }

    interface AgentRuntimes {}
  }
}
