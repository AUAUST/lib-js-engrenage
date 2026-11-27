import { getRunContext } from "#nexus/cli/index";
import { dataEntry, lineEntry } from "#nexus/reports/index";
import { listDebtMarkers } from "#tools/eslint/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const markers = await listDebtMarkers(
    await loadValidatedConfig(undefined, { reporter }),
  );

  const lines = markers.length === 0
    ? [lineEntry("No debt markers.")]
    : markers.map(({ file, line, statement }) => {
        return lineEntry(`${file}:${line}  ${statement}`);
      });

  reporter.log(dataEntry(markers, lines));
}
