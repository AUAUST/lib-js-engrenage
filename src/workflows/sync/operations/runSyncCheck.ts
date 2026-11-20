import { map } from "@auaust/toolkit/iterable";

import {
  listBlockingDiagnostics,
  renderStructureDiagnostic,
} from "#batiment/structure/index";
import {
  formatReport,
  type ReportData,
  type Reporter,
} from "#foundation/reports/index";
import {
  collectChanges,
  formatSyncFailure,
  formatSyncResult,
  runSync,
} from "#project/sync/index";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

function createRecordingReporter(problems: string[]): Reporter {
  function record(text: string, data?: ReportData) {
    problems.push(formatReport(text, data));
  }

  function ignore() {}

  return {
    error: record,
    warn: record,
    info: ignore,
    log: ignore,
  };
}

export async function runSyncCheck(config: LoadedConfig): Promise<GateResult> {
  const blocking = listBlockingDiagnostics(await config.resolve("structure"));

  if (blocking.length > 0) {
    return {
      ok: false,
      output: blocking.map(renderStructureDiagnostic).join("\n"),
    };
  }

  const problems: string[] = [];

  const copy = config.context.copy({
    reporter: createRecordingReporter(problems),
  });

  const failures = await runSync(copy);

  const outdated = await collectChanges(copy, { check: true });

  return {
    ok: outdated.length === 0 && failures.length === 0,
    output: [
      ...map(outdated, formatSyncResult),
      ...map(failures, formatSyncFailure),
    ].join("\n"),
    ...(problems.length > 0 && { warnings: problems.join("\n") }),
  };
}
