import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type {
  ScenarioDetector,
  ScenarioPrinters,
} from "#nexus/scenarios/index";

/**
 * A program: its root command, the output scenarios it prints for and the
 * detectors resolving one when `--output` names none.
 */
export interface ProgramDeclaration {
  readonly root: CommandDeclaration;
  readonly scenarios: ScenarioPrinters;
  readonly detectors: readonly ScenarioDetector[];
}
