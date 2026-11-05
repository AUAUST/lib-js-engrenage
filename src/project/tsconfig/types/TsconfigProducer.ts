import type { JsonEdit } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export type TsconfigProducer = (
  config: ConfigContext,
  target: TsconfigTarget,
) => readonly JsonEdit[] | Promise<readonly JsonEdit[]>;
