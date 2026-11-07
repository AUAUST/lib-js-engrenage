import { structureOptionsSection } from "#project/structure/config/sections/structureOptionsSection";
import { effectModulesSection } from "#project/structure/config/sections/effectModulesSection";
import { typescriptOptionsSection } from "#project/tsconfig/index";
import type { Resolver } from "#foundation/options/index";
import type { Role } from "#project/roles/index";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";

export async function readEnvironmentRoles(
  config: Resolver,
  roles: readonly Role[],
): Promise<EnvironmentRoles> {
  const [{ effects }, { verbatimModuleSyntax }, defaultModules] = await Promise.all([
    config.resolve(structureOptionsSection),
    config.resolve(typescriptOptionsSection),
    config.resolve(effectModulesSection),
  ]);

  return {
    roles,
    effects,
    defaultModules,
    verbatimModuleSyntax,
  };
}
