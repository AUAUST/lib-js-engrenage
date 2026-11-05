import type { JsonEdit } from "#foundation/json/index";
import type { ProjectConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ProjectConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[];
