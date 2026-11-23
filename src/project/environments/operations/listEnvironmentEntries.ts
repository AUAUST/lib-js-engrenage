import { freeze } from "@auaust/toolkit/object";

import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export async function listEnvironmentEntries(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironmentEntry[]> {
  const { registry } = config.context;

  const [environments, kinds] = await Promise.all([
    registry.contributions("environments", config),
    registry.contributions("environmentKinds", config),
  ]);

  const byName = new Map(kinds.map(({ entry }) => [entry.name, entry]));

  return freeze(
    environments.map(({ entry }) => {
      const kind = byName.get(entry.kind);

      if (kind === undefined) {
        throw new Error(
          `Environment "${entry.name}" names the kind "${entry.kind}", which no active extension contributes`,
        );
      }

      return freeze({ entry, kind });
    }),
  );
}
