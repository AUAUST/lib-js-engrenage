import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

/**
 * Computes the JSON edits sync applies to one tsconfig target, an empty list
 * when the producer does not apply to it. Edits to the paths the target leaves
 * unmanaged are dropped, and the target's configured `compilerOptions` are
 * applied after every producer's edits.
 */
export type TsconfigProducer = (
  config: LoadedConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[] | Promise<readonly JsonEdit[]>;
