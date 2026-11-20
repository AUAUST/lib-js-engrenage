import { freeze, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { listEnvironmentEntries } from "#project/environments/index";
import { noRoles } from "#project/structure/constants";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

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
