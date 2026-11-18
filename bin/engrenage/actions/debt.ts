import { listDebtMarkers } from "#tools/eslint/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ json }: { json: boolean }): Promise<void> {
  const markers = await listDebtMarkers(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
  );

  if (json) {
    getRunContext().reporter.log(JSON.stringify(markers, null, 2));
  } else if (markers.length === 0) {
    getRunContext().reporter.log("No debt markers.");
  } else {
    for (const { file, line, statement } of markers) {
      getRunContext().reporter.log(`${file}:${line}  ${statement}`);
    }
  }
}
