import { freeze, record } from "@auaust/toolkit/object";

import { noRoles } from "#batiment/roles/constants";
import { resolveRoles, type ResolvedRoles } from "#batiment/roles/index";
import { declareSection } from "#foundation/options/index";
import { listEnvironmentEntries } from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import type { ConfigResolver } from "#project/config/index";

async function resolveEnvironmentRoles(
  config: ConfigResolver,
  name: string,
): Promise<ResolvedRoles> {
  const roles = await readEnvironmentRoles(config, name);

  return roles === undefined
    ? noRoles
    : resolveRoles({ ...roles, environment: name });
}

export const environmentRolesSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Partial<Record<string, ResolvedRoles>>>> {
    const environments = await listEnvironmentEntries(config);

    const roles = await Promise.all(
      environments
        .filter(({ kind }) => kind.structure !== undefined)
        .map(async ({ entry: { name } }) => {
          return [name, await resolveEnvironmentRoles(config, name)] as const;
        }),
    );

    return freeze(record(roles));
  },
});
