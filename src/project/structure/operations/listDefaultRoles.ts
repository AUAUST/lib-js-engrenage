import { loadLazy } from "#foundation/modules/index";
import type { ConfigResolver } from "#project/config/index";
import type { Role } from "#project/roles/index";

export async function listDefaultRoles(
  config: ConfigResolver,
  environment: string,
): Promise<readonly Role[]> {
  const [contributions, traits] = await Promise.all([
    config.context.registry.contributions("roles", config),
    config.resolve("traits"),
  ]);

  const entries = contributions
    .map(({ entry }) => entry)
    .filter(({ environments, traits: required = [] }) => {
      return (
        environments.includes(environment) &&
        required.every((trait) => traits[trait])
      );
    });

  return Promise.all(
    entries.map(async (entry) => {
      const preset = await loadLazy(entry);

      return preset();
    }),
  );
}
