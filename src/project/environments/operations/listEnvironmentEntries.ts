import { freeze } from "@auaust/toolkit/object";

import { readKinds } from "#project/environments/operations/readKinds";
import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export async function listEnvironmentEntries(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironmentEntry[]> {
  const [environments, kinds] = await Promise.all([
    config.context.registry.contributions("environments", config),
    readKinds(config),
  ]);

  return freeze(
    environments.map(({ entry }) => {
      const kind = kinds.environments.get(entry.kind);

      if (kind === undefined) {
        throw new Error(
          `Environment "${entry.name}" names the kind "${entry.kind}", which no active extension contributes`,
        );
      }

      const namespace = kinds.namespaces.get(entry.name);

      if (namespace === undefined) {
        throw new Error(
          `Environment "${entry.name}" covers the top-level namespace "${entry.name}", whose namespace kind no active extension contributes`,
        );
      }

      return freeze({
        entry,
        kind,
        namespace,
      });
    }),
  );
}
