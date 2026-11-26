import type { ToolRuns } from "#workflows/cli/types/ToolRuns";
import type { LoadedConfig } from "#workflows/config/index";

/**
 * Resolves the arguments of a tool command's binary from the command's own: one
 * run's arguments, or several runs.
 */
export type ToolAction = (
  args: string[],
  config: LoadedConfig,
) => readonly string[] | ToolRuns | Promise<readonly string[] | ToolRuns>;
