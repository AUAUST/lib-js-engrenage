import { freeze } from "@auaust/toolkit/object";

import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export async function listEnvironmentEntries(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironmentEntry[]> {
  const [environments, kinds] = await Promise.all([
    config.context.registry.contributions("environments", config),
    config.context.registry.contributions("environmentKinds", config),
  ]);

  const kindsByName = new Map(kinds.map(({ entry }) => [entry.name, entry]));

  return freeze(
    environments.map(({ entry }) => {
      const kind = kindsByName.get(entry.kind);

      if (kind === undefined) {
        throw new Error(
          `Environment "${entry.name}" names the kind "${entry.kind}", which no active extension contributes`,
        );
      }

      return freeze({ entry, kind });
    }),
  );
}
