import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

interface ResolvedChain {
  readonly kind: "chain";
  /**
   * The path of the chain's first invocation.
   */
  readonly path: CommandPath;
  /**
   * Each invocation of the chain, in the order it runs.
   */
  readonly invocations: readonly Extract<Resolution, { kind: "invocation" }>[];
  /**
   * The scenario the first invocation's command or a group above it declares.
   */
  readonly scenario?: string;
  /**
   * The run options every invocation sets, applying to the whole run.
   */
  readonly runOptions: RunOptionValues;
}

/**
 * What a run's argv resolves to against a program, every invocation resolved: the
 * chain of several chainable invocations, the one invocation of a run holding no
 * `--next`, a request for help or the version, or every usage error found, each
 * with the command path of the run's first invocation, as far as it resolved.
 */
export type RunResolution = Resolution | ResolvedChain;
