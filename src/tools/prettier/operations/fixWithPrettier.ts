import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

// @debt only changed files are formatted, so a Prettier config or plugin change leaves unchanged files for CI to reject
// @debt every changed file is formatted, including files outside the declared environments and engrenage's own files
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
