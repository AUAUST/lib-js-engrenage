import { detectScenario } from "#nexus/scenarios/operations/detectScenario";
import { loadScenarioPrinter } from "#nexus/scenarios/operations/loadScenarioPrinter";
import { nexusDetectors } from "#nexus/scenarios/operations/nexusDetectors";
import { nexusScenarios } from "#nexus/scenarios/operations/nexusScenarios";
import type { Printer } from "#nexus/reports/index";
import type { ScenarioDetector } from "#nexus/scenarios/types/ScenarioDetector";
import type { ScenarioPrinters } from "#nexus/scenarios/types/ScenarioPrinters";

/**
 * Loads the printer of the scenario `detectors` resolve among `scenarios`, for
 * reports outside any program run.
 *
 * @throws {Error} When no detector names a scenario of `scenarios`.
 */
export function detectPrinter({
  scenarios = nexusScenarios,
  detectors = nexusDetectors,
}: {
  scenarios?: ScenarioPrinters;
  detectors?: readonly ScenarioDetector[];
} = {}): Promise<Printer> {
  return loadScenarioPrinter(detectScenario(detectors, scenarios), {
    scenarios,
  });
}
