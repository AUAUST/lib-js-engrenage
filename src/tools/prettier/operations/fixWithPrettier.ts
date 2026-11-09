import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

export function fixWithPrettier(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  return runGateBinary(config.context.root, packages.prettier, [
    "--write",
    "--ignore-unknown",
    "--",
    ...files,
  ]);
}
