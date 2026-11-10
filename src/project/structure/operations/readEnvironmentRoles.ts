import type { ConfigResolver } from "#project/config/index";
import type { Role } from "#project/roles/index";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";

export async function readEnvironmentRoles(
  config: ConfigResolver,
  roles: readonly Role[],
): Promise<EnvironmentRoles> {
  const [
    { effects },
    { verbatimModuleSyntax },
    defaultModules,
  ] = await Promise.all([
    config.resolve("structure.options"),
    config.resolve("typescript.options"),
    config.resolve("effectModules"),
  ]);

  return {
    roles,
    effects,
    defaultModules,
    verbatimModuleSyntax,
  };
}
