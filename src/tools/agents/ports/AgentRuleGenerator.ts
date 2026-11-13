import type { EntryShape } from "#foundation/extensions/index";
import type { LoadedConfig } from "#project/config/index";
import type { GeneratedRule } from "#tools/agents/ports/GeneratedRule";
import type { Directory } from "#types/Directory";

export interface AgentRuleGenerator extends EntryShape {
  /**
   * Rule files the generator owns in the rules directory: `<name>.md` and
   * `<name>/*.md`. Sync removes those it no longer returns and throws on a rule
   * outside them.
   */
  readonly name: string;
  /**
   * Loads the function listing the rules to write, given the loaded config and
   * the rules directory; called only when an agent is preferred.
   */
  load(): Promise<
    (
      config: LoadedConfig,
      directory: Directory,
    ) => Promise<readonly GeneratedRule[]>
  >;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.rules": AgentRuleGenerator;
    }
  }
}
