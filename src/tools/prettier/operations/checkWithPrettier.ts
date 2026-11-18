import { packages } from "#constants";
import { ensureIncludes } from "#foundation/processes/index";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolvePrettierAllArguments } from "#tools/prettier/operations/resolvePrettierAllArguments";
import { resolveSourcePrettierConfig } from "#tools/prettier/operations/resolveSourcePrettierConfig";
import type { LoadedConfig } from "#project/config/index";

export async function checkWithPrettier(
  config: LoadedConfig,
): Promise<GateResult> {
  const [args, configFile] = await Promise.all([
    resolvePrettierAllArguments(config, ["--check"]),
    resolveSourcePrettierConfig(config),
  ]);

  if (configFile !== undefined) {
    ensureIncludes(args, ["--config", configFile]);
  }

  return runGateBinary(config.context.root, packages.prettier, args);
}
