import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import {
  scriptsOptionsSection,
  sourceOptionsSection,
  testsOptionsSection,
  toolingOptionsSection,
} from "#project/environments/index";
import { noRoles } from "#project/structure/constants";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { Role } from "#project/roles/index";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";

async function resolveEnvironmentRoles(
  config: Resolver,
  name: RoleEnvironment,
  option: { readonly enabled: boolean; readonly roles?: readonly Role[] },
): Promise<ResolvedRoles> {
  return option.enabled && option.roles !== undefined
    ? resolveRoles({
        ...(await readEnvironmentRoles(config, option.roles)),
        environment: name,
      })
    : noRoles;
}

export const environmentRolesSection = declareSection({
  name: "environmentRoles",
  async resolve(
    _input,
    config,
  ): Promise<Readonly<Record<StructureEnvironmentName, ResolvedRoles>>> {
    const [sourceOption, testsOption, scriptsOption, toolingOption] =
      await Promise.all([
        config.resolve(sourceOptionsSection),
        config.resolve(testsOptionsSection),
        config.resolve(scriptsOptionsSection),
        config.resolve(toolingOptionsSection),
      ]);

    const [source, tests, scripts, tooling] = await Promise.all([
      resolveEnvironmentRoles(config, "src", sourceOption),
      resolveEnvironmentRoles(config, "tests", testsOption),
      resolveEnvironmentRoles(config, "scripts", scriptsOption),
      resolveEnvironmentRoles(config, "tooling", toolingOption),
    ]);

    return freeze({
      src: source,
      tests,
      bin: noRoles,
      scripts,
      tooling,
    });
  },
});
