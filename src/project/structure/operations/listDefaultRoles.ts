import { loadLazy } from "#foundation/modules/index";
import type { Role } from "#batiment/roles/index";
import type { ConfigResolver } from "#project/config/index";

export async function listDefaultRoles(
  config: ConfigResolver,
  environment: string,
): Promise<readonly Role[]> {
  const [contributions, traits, environments] = await Promise.all([
    config.context.registry.contributions("roles", config),
    config.resolve("traits"),
    config.resolve("environments"),
  ]);

  const kind = environments.find(({ entry }) => entry.name === environment)
    ?.kind.name;

  if (kind == null) {
    return [];
  }

  const entries = contributions
    .map(({ entry }) => entry)
    .filter(({ environments, traits: required = [] }) => {
      return (
        environments.includes(kind) && required.every((trait) => traits[trait])
      );
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
