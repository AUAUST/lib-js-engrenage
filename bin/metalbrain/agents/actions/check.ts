import { formatAgentCheck } from "#metalbrain/runtimes/index";
import { checkAgents } from "#tools/agents/index";
import { hookRoots } from "#tools/metalbrain/constants";
import { loadInstructionFormatter } from "#tools/metalbrain/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const findings = await checkAgents(config, {
    format: await loadInstructionFormatter(config),
    roots: hookRoots,
  });

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
