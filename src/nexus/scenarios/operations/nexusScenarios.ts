import { densePrinter } from "#nexus/reports/index";
import type { ScenarioPrinters } from "#nexus/scenarios/types/ScenarioPrinters";

/**
 * Nexus's scenarios: `agent` printing dense text, `human` rich text and `json`
 * one JSON line per entry, each printer loaded only when its scenario resolves.
 */
export const nexusScenarios: ScenarioPrinters = {
  agent: () => densePrinter,
  async human() {
    const {
      createRichPrinter,
    } = await import("#nexus/reports/adapters/createRichPrinter");

    return createRichPrinter();
  },
  async json() {
    const { jsonPrinter } = await import("#nexus/reports/adapters/jsonPrinter");

    return jsonPrinter;
  },
};
