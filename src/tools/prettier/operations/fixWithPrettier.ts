import { packages } from "#constants";
import { runGateBinary, type GateResult } from "#project/gate/index";
import { resolveSourcePrettierConfig } from "#tools/prettier/operations/resolveSourcePrettierConfig";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

// @debt only changed files are formatted, so a Prettier config or plugin change leaves unchanged files for CI to reject
// @debt every changed file is formatted, including files outside the declared environments and engrenage's own files
export async function fixWithPrettier(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  const configFile = await resolveSourcePrettierConfig(config);

  return runGateBinary(config.context.root, packages.prettier, [
    "--write",
    "--ignore-unknown",
    ...(configFile === undefined ? [] : ["--config", configFile]),
    "--",
    ...files,
  ]);
}
