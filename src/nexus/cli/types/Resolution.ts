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
  /**
   * The scenario the deepest command of the path declaring one prints for.
   */
  readonly scenario?: string;
  /**
   * Whether a run may chain the invocation with others: neither a forwarding
   * command nor below a command declaring itself unchainable.
   */
  readonly chainable: boolean;
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
  /**
   * The path of the command giving the version.
   */
  readonly path: CommandPath;
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
  /**
   * The scenario the deepest command of the path as far as it resolved
   * declaring one prints for.
   */
  readonly scenario?: string;
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
