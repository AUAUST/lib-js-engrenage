import type { EntryShape } from "#foundation/extensions/index";
import type { LoadedConfig } from "#project/config/index";
import type { GeneratedRule } from "#tools/agents/ports/GeneratedRule";
import type { Directory } from "#types/Directory";

export interface AgentRuleGenerator extends EntryShape {
  readonly name: string;
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
