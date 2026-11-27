import { freeze } from "@auaust/toolkit/object";

import { helpCommandName } from "#nexus/cli/constants";
import { findSubcommand } from "#nexus/cli/utils/findSubcommand";
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
 * default, which `--output` names or else the first of `detectors` does. A root
 * group holds nexus's `help` command besides its own subcommands.
 *
 * @throws {TypeError} When `root` declares a `help` subcommand.
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
  if (findSubcommand(root, helpCommandName) !== undefined) {
    throw new TypeError(
      `The ${root.name} program declares the ${helpCommandName} command, which nexus reserves`,
    );
  }

  return freeze({
    kind: "program",
    root,
    scenarios,
    detectors: freeze([...detectors]),
  });
}
