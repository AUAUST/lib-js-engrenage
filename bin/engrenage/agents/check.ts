import { reportAgentChecks } from "#tools/agents/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { loadValidatedConfig } from "#workflows/config/operations/loadValidatedConfig";

export const check = defineCommand((command) => {
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
