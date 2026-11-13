import type { MaybePromise } from "@auaust/toolkit/types";

import type { EntryShape } from "#foundation/extensions/index";
import type { LoadedConfig } from "#project/config/index";

export interface AgentFiller extends EntryShape {
  /**
   * Directive the filler answers, written `@<name>` in instruction markers;
   * unique across the slot.
   */
  readonly name: string;
  /**
   * Loads the function producing a marker's block content from the loaded config
   * and the marker's arguments.
   */
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
