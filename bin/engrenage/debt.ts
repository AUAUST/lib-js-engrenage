import { listDebtMarkers } from "#tools/eslint/operations/listDebtMarkers";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

export const debt = defineCommand((command) => {
  return command
    .option("--json", "print the markers as JSON", false)
    .action(async ({ json }) => {
      const config = await loadConfig();

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
