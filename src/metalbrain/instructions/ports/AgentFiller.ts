import type { MaybePromise } from "@auaust/toolkit/types";

import type { EntryShape } from "#foundation/extensions/index";
import type { Lazy } from "#foundation/modules/index";

/**
 * Produces a marker's block content from the host's input and the
 * marker's arguments.
 */
export interface AgentFiller<Host>
  extends
    EntryShape,
    Lazy<(host: Host, ...args: string[]) => MaybePromise<string>> {
  /**
   * Directive the filler answers, written `@<name>` in instruction markers;
   * unique across the slot.
   */
  readonly name: string;
}
