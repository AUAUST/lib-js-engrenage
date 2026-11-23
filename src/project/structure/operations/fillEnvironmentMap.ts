import { renderNamespaceMap } from "#batiment/structure/index";
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

  return renderNamespaceMap({
    name,
    namespace: environment,
    roles: roles[name],
    aliases: [...aliases.global, ...aliases.src],
  });
}
