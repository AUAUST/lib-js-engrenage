import { runProgram } from "#nexus/cli/operations/runProgram";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";

/**
 * Runs `program` on the arguments of the running process, as its executable
 * module's only call, with no run setting of its own, so the program runs directly
 * as it does mounted by a directory source.
 *
 * @effectful
 */
export function launch(program: ProgramDeclaration): Promise<void> {
  return runProgram(program);
}
