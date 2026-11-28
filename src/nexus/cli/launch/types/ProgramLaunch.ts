import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { RunSettings } from "#nexus/cli/types/RunSettings";

/**
 * A program a launch runs, with the settings it runs with.
 */
export interface ProgramLaunch extends RunSettings {
  readonly program: ProgramDeclaration;
}
