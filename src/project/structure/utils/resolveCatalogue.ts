import { entries, record } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import { noRoleEffects, roleCatalogue } from "#project/structure/constants";
import { completeRole } from "#project/structure/utils/completeRole";
import { normalizeRoles } from "#project/structure/utils/normalizeRoles";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export const resolveCatalogue = once(
  (): Readonly<Record<string, ResolvedRoleContract>> => {
    const { define } = normalizeRoles({
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
      effects: noRoleEffects,
    });

    return record(
      entries(define).map(([name, definition]) => {
        return [name, completeRole(definition)] as const;
      }),
    );
  },
);
