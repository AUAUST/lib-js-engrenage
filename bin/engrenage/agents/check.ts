import { reportAgentChecks } from "#tools/agents/index";
import { defineLegacyCommand } from "#workflows/cli/operations/defineLegacyCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

export const check = defineLegacyCommand((command) => {
  return command.action(async () => {
    const findings = await reportAgentChecks(await loadValidatedConfig());

    if (
      findings.some(({ status }) => {
        return (
          status === "conflicting" ||
          status === "disabled" ||
          status === "unsupported"
        );
      })
    ) {
      process.exitCode = 1;
    }
  });
});
