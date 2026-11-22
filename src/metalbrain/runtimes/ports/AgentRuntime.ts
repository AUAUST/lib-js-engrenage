import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { AgentDispatcher } from "#metalbrain/runtimes/ports/AgentDispatcher";
import type { Directory } from "#types/Directory";

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
  /**
   * Directory holding one directory per installed skill; without it, the
   * runtime gets no skills.
   */
  readonly skills?: Directory;
  /**
   * Directory of agent files embedding skill bodies, rendered with the
   * paths of `skills`.
   */
  readonly agents?: Directory;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.runtimes": AgentRuntime;
    }

    interface AgentRuntimes {}
  }
}
