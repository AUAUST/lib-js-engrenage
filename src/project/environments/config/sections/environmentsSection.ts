import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { readEnvironment } from "#project/environments/operations/readEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";

export const environmentsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly EnvironmentEntry[]> {
    const contributions = await config.context.registry.contributions(
      "environments",
      config,
    );

    const resolved = await Promise.all(
      contributions.map(async ({ entry }) => {
        const { active } = await readEnvironment(config, entry.name);

        return { entry, active };
      }),
    );

    return freeze(
      resolved.filter(({ active }) => active).map(({ entry }) => entry),
    );
  },
});
