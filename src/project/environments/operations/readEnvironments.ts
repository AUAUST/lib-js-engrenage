import { freeze } from "@auaust/toolkit/object";

import { discoverDeclaredEnvironment } from "#project/environments/operations/discoverDeclaredEnvironment";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { readEnvironment } from "#project/environments/operations/readEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ContributedEnvironment } from "#project/environments/types/ContributedEnvironment";

export async function readEnvironments(
  config: ConfigResolver,
): Promise<readonly ContributedEnvironment[]> {
  const entries = await listEnvironmentEntries(config);

  return freeze(
    await Promise.all(
      entries.map(async (contributed) => {
        const { name } = contributed.entry;

        const [environment, { kind: namespace }] = await Promise.all([
          readEnvironment(config, name),
          discoverDeclaredEnvironment(config, name),
        ]);

        return freeze({
          ...contributed,
          environment,
          namespace,
        });
      }),
    ),
  );
}
