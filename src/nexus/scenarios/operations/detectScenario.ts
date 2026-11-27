import { join } from "@auaust/toolkit/array";
import { hasOwn, keys } from "@auaust/toolkit/object";

import type { ScenarioDetector } from "#nexus/scenarios/types/ScenarioDetector";
import type { ScenarioPrinters } from "#nexus/scenarios/types/ScenarioPrinters";

/**
 * The first scenario of `scenarios` one of `detectors` names, tried in order.
 *
 * @throws {Error} When no detector names a scenario of `scenarios`.
 */
export function detectScenario(
  detectors: readonly ScenarioDetector[],
  scenarios: ScenarioPrinters,
): string {
  for (const detect of detectors) {
    const scenario = detect();

    if (scenario !== undefined && hasOwn(scenarios, scenario)) {
      return scenario;
    }
  }

  throw new Error(
    `No detector names one of the declared scenarios: ${join(keys(scenarios), ", ")}`,
  );
}
