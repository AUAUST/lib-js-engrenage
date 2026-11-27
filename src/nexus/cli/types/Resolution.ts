import type { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

interface ResolvedInvocation {
  readonly kind: "invocation";
  readonly path: CommandPath;
  readonly declaration: CommandDeclaration;
  /**
   * The parameters the command's action receives.
   */
  readonly parameters: readonly unknown[];
  readonly runOptions: RunOptionValues;
}

interface ResolvedHelp {
  readonly kind: "help";
  readonly path: CommandPath;
  readonly declaration: CommandDeclaration;
  readonly runOptions: RunOptionValues;
}

interface ResolvedVersion {
  readonly kind: "version";
  readonly version: string;
  readonly runOptions: RunOptionValues;
}

interface ResolutionFailure {
  readonly kind: "failure";
  /**
   * The path as far as it resolved.
   */
  readonly path: CommandPath;
  readonly errors: readonly CommandUsageError[];
  /**
   * The help to print with the errors: a group's own, when the path stops at it
   * without naming a command.
   */
  readonly help?: Pick<ResolvedHelp, "path" | "declaration">;
  readonly runOptions: RunOptionValues;
}

/**
 * What an argv resolves to against a program: the invocation to run, a request
 * for a command's help or the program's version, or every usage error found.
 */
export type Resolution =
  | ResolvedInvocation
  | ResolvedHelp
  | ResolvedVersion
  | ResolutionFailure;
