import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { readEnvironments } from "#project/environments/operations/readEnvironments";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";

export const environmentsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly EnvironmentEntry[]> {
    const environments = await readEnvironments(config);

    return freeze(
      environments
        .filter(({ environment }) => environment.active)
        .map(({ entry }) => entry),
    );
  },
});
