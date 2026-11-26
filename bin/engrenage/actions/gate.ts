import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";
import {
  formatGateEntry,
  formatGateSummary,
  runGate,
  runMessageGate,
  type GateReport,
  type MessageGateReport,
} from "#workflows/gate/index";

function loadConfig() {
  return loadValidatedConfig(undefined, { reporter: getRunContext().reporter });
}

async function checkMessage(
  message: string,
  audience: "everyone" | "agents",
): Promise<MessageGateReport> {
  if (audience === "everyone") {
    return runMessageGate(message, { audience });
  }

  const config = await loadConfig();

  const { attribution } = await config.resolve("agents");

  return runMessageGate(message, {
    audience,
    attribution,
    config,
  });
}

export default async function ({
  all,
  worktree,
  everyone,
  message,
}: {
  all?: true | undefined;
  worktree?: true | undefined;
  everyone?: true | undefined;
  message?: string | undefined;
}): Promise<void> {
  const audience = everyone === true ? "everyone" : "agents";

  const { reporter } = getRunContext();

  const report: GateReport & Partial<MessageGateReport> = message === undefined
    ? await runGate(await loadConfig(), {
        mode: all === true ? "all" : worktree === true ? "worktree" : "staged",
        audience,
      })
    : await checkMessage(message, audience);

  const { failures, warnings } = report;

  if (report.rewritten === true) {
    reporter.log("Rewrote the Closes and Towards lines in canonical form.");
  }

  if (failures.length > 0) {
    reporter.error(formatGateSummary(failures));
  }

  for (const failure of failures) {
    reporter.error(formatGateEntry(failure));
  }

  for (const warning of warnings) {
    reporter.warn(formatGateEntry(warning));
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}
