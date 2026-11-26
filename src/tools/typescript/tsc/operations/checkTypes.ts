import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolveTscArguments } from "#tools/typescript/operations/resolveTscArguments";
import type { LoadedConfig } from "#project/config/index";

export async function checkTypes(config: LoadedConfig): Promise<GateResult> {
  const { args, skipped } = await resolveTscArguments(config, []);

  const result = await runGateBinary(
    config.context.root,
    packages.typescript,
    args,
    "tsc",
  );

  return skipped.length === 0
    ? result
    : { ...result, warnings: `Not type-checked: ${skipped.join(", ")}` };
}
