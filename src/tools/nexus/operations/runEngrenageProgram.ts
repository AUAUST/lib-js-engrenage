import {
  runProgram,
  type ProgramDeclaration,
  type RunSettings,
} from "#nexus/cli/index";
import { explainStaleBarrel } from "#tools/nexus/operations/explainStaleBarrel";
import type { Reporter } from "#nexus/reports/index";

// @debt resolves the config again after a failure instead of reading the config the failing command already resolved
async function resolveConfiguredDebug(reporter: Reporter): Promise<boolean> {
  const { loadValidatedConfig } = await import("#project/config/index");

  const config = await loadValidatedConfig(undefined, { reporter });

  return config.resolve("debug");
}

/**
 * Runs one of engrenage's programs, the `debug` config key turning debug on
 * besides the program's own debug variable, with the hand fix of a stale
 * barrel leading its error.
 */
export function runEngrenageProgram(
  program: ProgramDeclaration,
  argv?: readonly string[],
  settings: Omit<RunSettings, "resolveDebug" | "explain"> = {},
): Promise<void> {
  return runProgram(program, argv, {
    ...settings,
    resolveDebug: resolveConfiguredDebug,
    explain: explainStaleBarrel,
  });
}
