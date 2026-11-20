import {
  renderImportCycles,
  renderStructure,
  renderStructureDiagnostic,
} from "#batiment/structure/index";
import { reportStructure } from "#project/structure/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({
  check,
  json,
}: {
  check: boolean;
  json: boolean;
}): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const report = await reportStructure(config);

  if (json) {
    reporter.log(
      JSON.stringify(
        { facts: report.facts, diagnostics: report.diagnostics },
        null,
        2,
      ),
    );
  } else {
    const aliases = await config.resolve("aliases");

    for (const line of [
      ...renderStructure(report.facts.structure, [
        ...aliases.global,
        ...aliases.src,
      ]),
      ...renderImportCycles(report.facts.cycles),
    ]) {
      reporter.log(line);
    }

    for (const diagnostic of report.diagnostics) {
      if (diagnostic.severity === "warning") {
        reporter.warn(renderStructureDiagnostic(diagnostic));
      }
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
