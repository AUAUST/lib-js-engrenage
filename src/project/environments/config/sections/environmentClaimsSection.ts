import { array, is, object, optional, string, union } from "valibot";

import { freeze, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { getOptionsKey } from "#project/environments/utils/getOptionsKey";
import { readInputDirs } from "#project/environments/utils/readInputDirs";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentClaim } from "#project/environments/types/EnvironmentClaim";
import type { Directories } from "#types/Directories";

const adjustedItems = optional(union([string(), array(string())]));

const adjustedDirs = object({
  dirs: object({ prepend: adjustedItems, append: adjustedItems }),
});

function readAdjustedDirs(input: unknown): Directories {
  if (!is(adjustedDirs, input)) {
    return [];
  }

  const { prepend = [], append = [] } = input.dirs;

  return [prepend, append].flat();
}

export const environmentClaimsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, EnvironmentClaim>>> {
    const environments = await listEnvironmentEntries(config);

    const claims = await Promise.all(
      environments.map(async (environment) => {
        const { entry } = environment;

        const input = await config.input(getOptionsKey(environment));

        const dirs = readInputDirs(input);

        const claim: EnvironmentClaim = freeze({
          owns: entry.owns ?? [],
          dirs,
          named: dirs ?? readAdjustedDirs(input),
        });

        return [entry.name, claim] as const;
      }),
    );

    return freeze(record(claims));
  },
});
