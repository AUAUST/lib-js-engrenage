import { flatMap, map } from "@auaust/toolkit/array";
import { getOwn } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import {
  readEnvironmentLanguages,
  readScopeNamespaces,
} from "#project/environments/index";
import type { Role } from "#batiment/roles/index";
import type { ConfigResolver } from "#project/config/index";

async function readLanguages(
  config: ConfigResolver,
  environments: readonly string[],
): Promise<ReadonlySet<string>> {
  const selections = await Promise.all(
    map(environments, (environment) => {
      return readEnvironmentLanguages(config, environment);
    }),
  );

  return new Set(
    flatMap(selections, (languages) => map(languages, ({ name }) => name)),
  );
}

/**
 * Lists the default roles of the `namespace` kind for the languages
 * `environments` select.
 */
export async function listDefaultRoles(
  config: ConfigResolver,
  namespace: string,
  environments: readonly string[],
): Promise<readonly Role[]> {
  const [contributions, traits, namespaces] = await Promise.all([
    config.context.registry.contributions("roles", config),
    config.resolve("traits"),
    readScopeNamespaces(config),
  ]);

  const discovered = getOwn(namespaces, namespace);

  if (discovered?.active !== true) {
    return [];
  }

  const kind = discovered.kind.name;

  const languages = await readLanguages(config, environments);

  const entries = contributions
    .map(({ entry }) => entry)
    .filter(
      ({ environments: kinds, traits: required = [], languages: served }) => {
        return (
          kinds.includes(kind) &&
          required.every((trait) => traits[trait]) &&
          (served === undefined || served.some((name) => languages.has(name)))
        );
      },
    );

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
