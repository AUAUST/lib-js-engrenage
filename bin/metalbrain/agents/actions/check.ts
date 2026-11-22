import { formatAgentCheck } from "#metalbrain/runtimes/index";
import { checkAgents } from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const findings = await checkAgents(
    await loadValidatedConfig(undefined, { reporter }),
  );

  for (const finding of findings) {
    reporter.log(formatAgentCheck(finding));
  }

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
