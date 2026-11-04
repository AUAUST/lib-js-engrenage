import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ResolvedConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[];
