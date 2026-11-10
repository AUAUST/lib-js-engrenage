import { checkStructure } from "#project/structure/operations/checkStructure";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

export async function runStructureCheck(
  config: LoadedConfig,
): Promise<GateResult> {
  const { lines, warnings, violated } = await checkStructure(config);

  return {
    ok: !violated,
    output: [...lines, ...warnings].join("\n"),
  };
}
