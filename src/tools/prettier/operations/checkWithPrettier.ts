import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolvePrettierAllArguments } from "#tools/prettier/operations/resolvePrettierAllArguments";
import type { LoadedConfig } from "#project/config/index";

export async function checkWithPrettier(
  config: LoadedConfig,
): Promise<GateResult> {
  return runGateBinary(
    config.context.root,
    packages.prettier,
    await resolvePrettierAllArguments(config, ["--check"]),
  );
}
