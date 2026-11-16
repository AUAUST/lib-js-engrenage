import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { eslintFlagArguments } from "#tools/eslint/constants";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

export function fixWithEslint(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  return runGateBinary(config.context.root, packages.eslint, [
    ...eslintFlagArguments,
    "--fix",
    "--no-warn-ignored",
    "--",
    ...files,
  ]);
}
