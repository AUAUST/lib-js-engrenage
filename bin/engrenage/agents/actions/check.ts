import { reportAgentChecks } from "#tools/agents/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
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
}
