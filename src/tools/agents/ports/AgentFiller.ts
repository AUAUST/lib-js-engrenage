import type { MaybePromise } from "@auaust/toolkit/types";

import type { EntryShape } from "#foundation/extensions/index";
import type { LoadedConfig } from "#project/config/index";

export interface AgentFiller extends EntryShape {
  readonly name: string;
  load(): Promise<
    (config: LoadedConfig, ...args: string[]) => MaybePromise<string>
  >;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.fillers": AgentFiller;
    }
  }
}
