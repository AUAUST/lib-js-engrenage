import type { MaybePromise } from "@auaust/toolkit/types";

import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";
import type { LoadedConfig } from "#project/config/index";

/**
 * Produces a marker's block content from the loaded config and the
 * marker's arguments.
 */
export interface AgentFiller
  extends
    EntryShape,
    Lazy<(config: LoadedConfig, ...args: string[]) => MaybePromise<string>> {
  /**
   * Directive the filler answers, written `@<name>` in instruction markers;
   * unique across the slot.
   */
  readonly name: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      "agents.fillers": AgentFiller;
    }
  }
}
