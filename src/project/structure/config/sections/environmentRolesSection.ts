import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import {
  binOptionsSection,
  scriptsOptionsSection,
  sourceOptionsSection,
  testsOptionsSection,
  toolingOptionsSection,
} from "#project/environments/index";
import { noRoles } from "#project/structure/constants";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { Role } from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";

async function resolveEnvironmentRoles(
  config: Resolver,
  name: RoleEnvironment,
  option: {
    readonly enabled: boolean;
    readonly roles?: readonly Role[];
    readonly tree?: ProgramLayout;
  },
): Promise<ResolvedRoles> {
  const roles = listEnvironmentRoles(option);

  return option.enabled && roles !== undefined
    ? resolveRoles({
        ...(await readEnvironmentRoles(config, roles)),
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
    const [sourceOption, testsOption, binOption, scriptsOption, toolingOption] =
      await Promise.all([
        config.resolve(sourceOptionsSection),
        config.resolve(testsOptionsSection),
        config.resolve(binOptionsSection),
        config.resolve(scriptsOptionsSection),
        config.resolve(toolingOptionsSection),
      ]);

    const [source, tests, bin, scripts, tooling] = await Promise.all([
      resolveEnvironmentRoles(config, "src", sourceOption),
      resolveEnvironmentRoles(config, "tests", testsOption),
      resolveEnvironmentRoles(config, "bin", binOption),
      resolveEnvironmentRoles(config, "scripts", scriptsOption),
      resolveEnvironmentRoles(config, "tooling", toolingOption),
    ]);

    return freeze({
      src: source,
      tests,
      bin,
      scripts,
      tooling,
    });
  },
});
