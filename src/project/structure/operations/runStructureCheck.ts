import { reportStructure } from "#project/structure/operations/reportStructure";
import { renderStructureDiagnostic } from "#project/structure/utils/renderStructureDiagnostic";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

export async function runStructureCheck(
  config: LoadedConfig,
): Promise<GateResult> {
  const { diagnostics } = await reportStructure(config);

  const errors = diagnostics.filter(({ severity }) => severity === "error");

  const warnings = diagnostics.filter(({ severity }) => {
    return severity === "warning";
  });

  return {
    ok: errors.length === 0,
    output: errors.map(renderStructureDiagnostic).join("\n"),
    ...(warnings.length === 0
      ? {}
      : { warnings: warnings.map(renderStructureDiagnostic).join("\n") }),
  };
}
