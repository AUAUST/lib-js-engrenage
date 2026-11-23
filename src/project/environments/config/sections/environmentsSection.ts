import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { readEnvironments } from "#project/environments/operations/readEnvironments";
import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironment } from "#project/environments/types/ContributedEnvironment";

export const environmentsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly ContributedEnvironment[]> {
    const environments = await readEnvironments(config);

    return freeze(environments.filter(({ environment }) => environment.active));
  },
});
