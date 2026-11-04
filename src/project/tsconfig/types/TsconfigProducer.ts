import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ProjectConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[];
