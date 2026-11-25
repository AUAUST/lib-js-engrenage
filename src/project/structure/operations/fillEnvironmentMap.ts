import { map } from "@auaust/toolkit/array";

import { resolveRoles } from "#batiment/roles/index";
import { renderNamespaceMap } from "#batiment/structure/index";
import { readDirectoryRoles } from "#project/structure/operations/readDirectoryRoles";
import type { LoadedConfig } from "#project/config/index";

export async function fillEnvironmentMap(
  config: LoadedConfig,
  name?: string,
): Promise<string> {
  const [structure, aliases, roles] = await Promise.all([
    config.resolve("structure"),
    config.resolve("aliases"),
    config.resolve("environmentRoles"),
  ]);

  const environment = name === undefined ? undefined : structure[name];

  if (name === undefined || environment === undefined) {
    throw new Error(
      `@environment-map expects a structured environment, got ${name ?? "none"}`,
    );
  }

  const directoryRoles = await readDirectoryRoles(config, name);

  return renderNamespaceMap({
    name,
    namespace: environment,
    roles: roles[name],
    directoryRoles: new Map(
      map([...directoryRoles], ([directory, declared]) => {
        return [
          directory,
          resolveRoles({ ...declared, namespace: name }),
        ] as const;
      }),
    ),
    aliases: [...aliases.global, ...aliases.src],
  });
}
