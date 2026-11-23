import { flatMap } from "@auaust/toolkit/array";
import { freeze, values } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { readKinds } from "#project/environments/index";
import type { EnvironmentInstance } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

export async function listEnvironmentInstances(
  config: ConfigResolver,
): Promise<readonly EnvironmentInstance[]> {
  const [{ scopes }, environments, kinds] = await Promise.all([
    config.resolve("scopes"),
    config.resolve("environments"),
    readKinds(config),
  ]);

  const titles = new Map(
    environments.map(({ entry }) => [entry.name, entry.title]),
  );

  return freeze(
    flatMap(values(scopes), (scope) => {
      return scope?.environments ?? [];
    }).map(({ id, scope, name, kind }) => {
      const resolved = kinds.environments.get(kind);

      if (resolved === undefined) {
        throw new Error(
          `Environment "${id}" names the kind "${kind}", which no active extension contributes`,
        );
      }

      const namespace = kinds.namespaces.get(name);

      if (namespace === undefined) {
        throw new Error(
          `Environment "${id}" covers the top-level namespace "${name}", whose namespace kind no active extension contributes`,
        );
      }

      const title = scope === rootScope
        ? titles.get(name)
        : `the ${id} environment's files`;

      if (title === undefined) {
        throw new Error(
          `Environment "${id}" has no \`environments\` item to take its title from`,
        );
      }

      return freeze({
        name: id,
        scope,
        title,
        kind: resolved,
        namespace,
      });
    }),
  );
}
