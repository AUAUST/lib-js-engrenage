import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

interface ResolvedChain {
  readonly kind: "chain";
  /**
   * The path of the chaining command.
   */
  readonly path: CommandPath;
  /**
   * The chaining command every invocation names.
   */
  readonly declaration: ParsingCommandDeclaration;
  /**
   * The parameters of each invocation, in order.
   */
  readonly invocations: readonly (readonly unknown[])[];
  /**
   * The scenario the chaining command or a group above it declares.
   */
  readonly scenario?: string;
  readonly runOptions: RunOptionValues;
}

/**
 * What a run's argv resolves to against a program, every invocation resolved:
 * a chaining command's invocations, the one invocation of any other command, a
 * request for help or the version, or every usage error found, each with the
 * command path of the run's first invocation, as far as it resolved.
 */
export type RunResolution = Resolution | ResolvedChain;
