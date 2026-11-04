import { entries, record } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import { roleCatalogue } from "#project/structure/constants";
import { normalizeRoles } from "#project/structure/utils/normalizeRoles";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export const resolveCatalogue = once(
  (): Readonly<Record<string, ResolvedRoleContract>> => {
    return normalizeRoles({
      enable: [],
      disable: [],
      define: record(
        entries(roleCatalogue).map(([name, contract]) => {
          return [
            name,
            roleContractSchema.resolve(contract, undefined, `roles.${name}`),
          ] as const;
        }),
      ),
      aliases: {},
    }).define;
  },
);
