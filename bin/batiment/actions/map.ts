import {
  renderImportCycles,
  renderStructure,
  renderStructureDiagnostic,
} from "#batiment/structure/index";
// @debt reports through engrenage's `project/structure` binding until a split CLI finds its host (BL-efac74)
import { getRunContext } from "#nexus/cli/index";
import { dataEntry, lineEntry } from "#nexus/reports/index";
import { reportStructure } from "#project/structure/index";
// @debt loads engrenage's config until a split CLI finds its host (BL-efac74)
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ check }: { check: boolean }): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const report = await reportStructure(config);

  const aliases = await config.resolve("aliases");

  // @debt the report's facts lack the scope tree, so the action resolves it again to tell its diagnostics apart from the others
  const scopes = await config.resolve("scopes");

  const lines = [
    ...renderStructure(report.facts.structure, [
      ...aliases.global,
      ...aliases.src,
    ]),
    ...renderImportCycles(report.facts.cycles),
  ];

  reporter.log(
    dataEntry(
      { facts: report.facts, diagnostics: report.diagnostics },
      lines.map((line) => {
        return lineEntry(line);
      }),
    ),
  );

  for (const diagnostic of scopes.diagnostics) {
    reporter.error(renderStructureDiagnostic(diagnostic));
  }

  for (const diagnostic of report.diagnostics) {
    if (diagnostic.severity === "warning") {
      reporter.warn(renderStructureDiagnostic(diagnostic));
    }
  }

  if (
    check &&
    report.diagnostics.some(({ severity }) => {
      return severity === "error";
    })
  ) {
    process.exitCode = 1;
  }
}
