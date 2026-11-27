import { detectAgent, hasTTY, isCI } from "std-env";

import type { ScenarioDetector } from "#nexus/scenarios/types/ScenarioDetector";

/**
 * Nexus's detectors: `agent` for an agent std-env detects, CI or a stdout
 * without a TTY, since a pipe or log reader gains nothing from color or
 * spacing, otherwise `human`.
 */
export const nexusDetectors: readonly ScenarioDetector[] = [
  () => {
    return detectAgent().name !== undefined || isCI || !hasTTY
      ? "agent"
      : undefined;
  },
  () => "human",
];
