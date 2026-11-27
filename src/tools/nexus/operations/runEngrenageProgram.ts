import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { runProgram } from "#nexus/cli/index";
import { debugEnvironmentVariable } from "#tools/nexus/constants";
import { explainStaleBarrel } from "#tools/nexus/operations/explainStaleBarrel";
import type { Reporter } from "#nexus/reports/index";
import type {
  ScenarioDetector,
  ScenarioPrinters,
} from "#nexus/scenarios/index";

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
async function resolveConfiguredDebug(reporter: Reporter): Promise<boolean> {
  const { loadValidatedConfig } = await import("#project/config/index");

  const config = await loadValidatedConfig(undefined, { reporter });

  return config.resolve("debug");
}

/**
 * Runs one of engrenage's programs, `ENGRENAGE_DEBUG` and the `debug` config key
 * turning debug on, with the hand fix of a stale barrel leading its error.
 */
export function runEngrenageProgram(
  program: CommandUnknownOpts,
  argv?: readonly string[],
  options: {
    signal?: AbortSignal;
    scenarios?: ScenarioPrinters;
    detectors?: readonly ScenarioDetector[];
    onError?(error: unknown): void;
  } = {},
): Promise<void> {
  return runProgram(program, argv, {
    ...options,
    debugVariable: debugEnvironmentVariable,
    resolveDebug: resolveConfiguredDebug,
    explain: explainStaleBarrel,
  });
}
