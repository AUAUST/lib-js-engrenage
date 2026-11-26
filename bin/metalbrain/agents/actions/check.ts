import { checkAgents, formatAgentCheck } from "#metalbrain/runtimes/index";
import { getRunContext } from "#nexus/cli/index";
import {
  loadAgentInputs,
  loadInstructionFormatter,
} from "#tools/metalbrain/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const findings = await checkAgents({
    ...(await loadAgentInputs(config)),
    format: await loadInstructionFormatter(config),
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
