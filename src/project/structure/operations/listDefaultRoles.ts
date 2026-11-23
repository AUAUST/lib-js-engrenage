import { getOwn } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import type { Role } from "#batiment/roles/index";
import type { ConfigResolver } from "#project/config/index";

export async function listDefaultRoles(
  config: ConfigResolver,
  environment: string,
): Promise<readonly Role[]> {
  const [contributions, traits, context] = await Promise.all([
    config.context.registry.contributions("roles", config),
    config.resolve("traits"),
    config.resolve("structure.context"),
  ]);

  const { namespaces } = await context.discover();

  const discovered = getOwn(namespaces, environment);

  if (discovered?.active !== true) {
    return [];
  }

  const kind = discovered.kind.name;

  const entries = contributions
    .map(({ entry }) => entry)
    .filter(({ environments: kinds, traits: required = [] }) => {
      return kinds.includes(kind) && required.every((trait) => traits[trait]);
    });

  return Promise.all(
    entries.map(async (entry) => {
      const preset = await loadLazy(entry);

      const role = preset();

      if (role.name !== entry.name) {
        throw new Error(
          `The "${entry.name}" roles contribution creates the "${role.name}" role; name the contribution after the role it creates`,
        );
      }

      return role;
    }),
  );
}
