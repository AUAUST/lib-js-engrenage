import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ResolvedConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[];
