import { map } from "@auaust/toolkit/iterable";

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

// @debt `runStep` keeps a step's output only when it fails, so the warnings recorded here vanish whenever the files are in sync; `GateResult` needs a warnings channel the gate prints
export async function runSyncCheck(config: LoadedConfig): Promise<GateResult> {
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
      ...problems,
    ].join("\n"),
  };
}
