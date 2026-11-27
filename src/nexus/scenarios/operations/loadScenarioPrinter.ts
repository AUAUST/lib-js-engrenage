import { getOwn } from "@auaust/toolkit/object";

import type { Printer } from "#nexus/reports/index";
import type { ScenarioPrinters } from "#nexus/scenarios/types/ScenarioPrinters";

/**
 * Loads the printer `bindings` bind to `scenario`, else the one `scenarios`
 * declares for it.
 *
 * @throws {Error} When neither has a printer for `scenario`.
 */
export async function loadScenarioPrinter(
  scenario: string,
  {
    scenarios,
    bindings,
  }: {
    scenarios: ScenarioPrinters;
    bindings?: ScenarioPrinters | undefined;
  },
): Promise<Printer> {
  const load = (
    (bindings === undefined ? undefined : getOwn(bindings, scenario)) ??
    getOwn(scenarios, scenario)
  );

  if (load === undefined) {
    throw new Error(`The scenario ${scenario} has no printer`);
  }

  return load();
}
