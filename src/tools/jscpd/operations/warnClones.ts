import { reportClones } from "#tools/jscpd/operations/reportClones";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";
import type { Files } from "#types/Files";

export async function warnClones(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  const report = await reportClones(config, files);

  return { ok: report === undefined, output: report ?? "" };
}
