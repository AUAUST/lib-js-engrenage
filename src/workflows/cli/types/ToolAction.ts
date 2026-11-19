import type { LoadedConfig } from "#workflows/config/index";

export type ToolAction = (
  args: string[],
  config: LoadedConfig,
) => readonly string[] | undefined | Promise<readonly string[] | undefined>;
