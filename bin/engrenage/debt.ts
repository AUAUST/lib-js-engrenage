import { loadConfig } from "#config/utils/loadConfig";
import { listDebtMarkers } from "#eslint/utils/listDebtMarkers";
import { defineCommand } from "#support/commander/utils/defineCommand";

export const debt = defineCommand((command) => {
  return command
    .description("List the @debt markers of the project.")
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
