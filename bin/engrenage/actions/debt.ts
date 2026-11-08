import { listDebtMarkers } from "#tools/eslint/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function ({ json }: { json: boolean }): Promise<void> {
  const markers = await listDebtMarkers(await loadValidatedConfig());

  if (json) {
    console.info(JSON.stringify(markers, null, 2));
  } else if (markers.length === 0) {
    console.info("No debt markers.");
  } else {
    for (const { file, line, statement } of markers) {
      console.info(`${file}:${line}  ${statement}`);
    }
  }
}
