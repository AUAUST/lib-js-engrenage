import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ResolvedConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[];
