import { checkStructure } from "#project/structure/operations/checkStructure";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

export async function runStructureCheck(
  config: LoadedConfig,
): Promise<GateResult> {
  const { violations, warnings, violated } = await checkStructure(config);

  return {
    ok: !violated,
    output: violations.join("\n"),
    ...(warnings.length === 0 ? {} : { warnings: warnings.join("\n") }),
  };
}
