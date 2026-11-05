import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: LoadedConfig,
  target: TsconfigTarget,
) => readonly JsonEdit[] | Promise<readonly JsonEdit[]>;
