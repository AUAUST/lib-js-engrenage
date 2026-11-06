import { structureOptionsSection } from "#project/config/operations/structureOptionsSection";
import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import type { Resolver } from "#foundation/options/index";
import type { Role } from "#project/roles/index";
import type { EnvironmentRoles } from "#project/structure/index";

export async function readEnvironmentRoles(
  config: Resolver,
  roles: readonly Role[],
): Promise<EnvironmentRoles> {
  const [{ effects }, { verbatimModuleSyntax }] = await Promise.all([
    config.resolve(structureOptionsSection),
    config.resolve(typescriptOptionsSection),
  ]);

  return {
    roles,
    effects,
    verbatimModuleSyntax,
  };
}
