import type { MaybePromise } from "@auaust/toolkit/types";

import type { Loadable } from "#foundation/modules/index";
import type { CommandPath } from "#nexus/cli/types/CommandPath";

/**
 * Loads a layer of a command known only at run time: a function resolving the
 * layer's value for the command at a path.
 */
export type LayerLoader<Value> = () => Promise<
  Loadable<(path: CommandPath) => MaybePromise<Value>>
>;
