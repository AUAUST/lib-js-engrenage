import type { CommandPath } from "#nexus/cli/types/CommandPath";

export interface CommandInvocation {
  readonly path: CommandPath;
  /**
   * The value of every option the command declares, loaded ones included, keyed
   * by name; run options aside.
   */
  readonly options: Readonly<Record<string, unknown>>;
}
