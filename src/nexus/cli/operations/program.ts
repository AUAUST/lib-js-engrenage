import { freeze } from "@auaust/toolkit/object";

import {
  nexusDetectors,
  nexusScenarios,
  type ScenarioDetector,
  type ScenarioPrinters,
} from "#nexus/scenarios/index";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";

/**
 * Declares a program running `root`, printing for one of `scenarios`, nexus's by
 * default, which `--output` names or else the first of `detectors` does.
 *
 * @pure
 */
export function program({
  root,
  scenarios = nexusScenarios,
  detectors = nexusDetectors,
}: {
  root: CommandDeclaration;
  scenarios?: ScenarioPrinters;
  detectors?: readonly ScenarioDetector[];
}): ProgramDeclaration {
  return freeze({
    root,
    scenarios,
    detectors: freeze([...detectors]),
  });
}
