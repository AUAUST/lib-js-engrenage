import { freeze, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { getOptionsKey } from "#project/environments/utils/getOptionsKey";
import { readInputDirs } from "#project/environments/utils/readInputDirs";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentClaim } from "#project/environments/types/EnvironmentClaim";

export const environmentClaimsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, EnvironmentClaim>>> {
    const contributions = await config.context.registry.contributions(
      "environments",
      config,
    );

    const claims = await Promise.all(
      contributions.map(async ({ entry }) => {
        const input = await config.input(getOptionsKey(entry));

        const claim: EnvironmentClaim = freeze({
          owns: entry.owns ?? [],
          dirs: readInputDirs(input),
        });

        return [entry.name, claim] as const;
      }),
    );

    return freeze(record(claims));
  },
});
