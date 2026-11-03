import { entries, freeze, record } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import { roleCatalogue } from "#project/structure/constants";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export const resolveCatalogue = once(
  (): Readonly<Record<string, ResolvedRoleContract>> => {
    return freeze(
      record(
        entries(roleCatalogue).map(([name, contract]) => {
          return [
            name,
            roleContractSchema.resolve(contract, undefined, `roles.${name}`),
          ] as const;
        }),
      ),
    );
  },
);
