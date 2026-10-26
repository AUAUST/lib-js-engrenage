import type { createResolvedConfig } from "#config/utils/createResolvedConfig";

export interface ResolvedConfig extends ReturnType<
  typeof createResolvedConfig
> {}
