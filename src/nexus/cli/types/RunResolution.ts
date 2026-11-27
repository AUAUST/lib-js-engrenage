import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

interface ResolvedChain {
  readonly kind: "chain";
  /**
   * The chaining command every invocation names.
   */
  readonly declaration: ParsingCommandDeclaration;
  /**
   * The parameters of each invocation, in order.
   */
  readonly invocations: readonly (readonly unknown[])[];
  readonly runOptions: RunOptionValues;
}

/**
 * What a run's argv resolves to against a program, every invocation resolved:
 * a chaining command's invocations, the one invocation of any other command, a
 * request for help or the version, or every usage error found.
 */
export type RunResolution =
  | Exclude<Resolution, { kind: "failure" }>
  | Omit<Extract<Resolution, { kind: "failure" }>, "path">
  | ResolvedChain;
