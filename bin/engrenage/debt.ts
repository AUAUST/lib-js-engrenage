import { listDebtMarkers } from "#tools/eslint/operations/listDebtMarkers";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

export const debt = defineLegacyCommand((command) => {
  return command
    .option("--json", "print the markers as JSON", false)
    .action(async ({ json }) => {
      const config = await loadValidatedConfig();

      const markers = await listDebtMarkers(config);

      if (json) {
        console.info(JSON.stringify(markers, null, 2));
      } else if (markers.length === 0) {
        console.info("No debt markers.");
      } else {
        for (const { file, line, statement } of markers) {
          console.info(`${file}:${line}  ${statement}`);
        }
      }
    });
});
