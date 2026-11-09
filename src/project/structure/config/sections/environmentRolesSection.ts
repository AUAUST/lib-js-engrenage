import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { noRoles } from "#project/structure/constants";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { ConfigResolver } from "#project/config/index";
import type { Role } from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";

async function resolveEnvironmentRoles(
  config: ConfigResolver,
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
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<StructureEnvironmentName, ResolvedRoles>>> {
    const [sourceOption, testsOption, binOption, scriptsOption, toolingOption] =
      await Promise.all([
        config.resolve("src.options"),
        config.resolve("tests.options"),
        config.resolve("bin.options"),
        config.resolve("scripts.options"),
        config.resolve("tooling.options"),
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
