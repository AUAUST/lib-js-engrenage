import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolveTscArguments } from "#tools/typescript/operations/resolveTscArguments";
import type { LoadedConfig } from "#project/config/index";

export async function checkTypes(config: LoadedConfig): Promise<GateResult> {
  const args = await resolveTscArguments(config, []);

  if (args === undefined) {
    return {
      ok: true,
      output: "",
    };
  }

  return runGateBinary(config.context.root, packages.typescript, args, "tsc");
}
