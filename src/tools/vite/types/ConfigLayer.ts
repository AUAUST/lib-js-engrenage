import type { AsyncFn } from "@auaust/toolkit/types";

import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";

/**
 * Produces a Vite config to merge over engrenage's from the loaded config and
 * Vite's config env.
 */
export type ConfigLayer = AsyncFn<Config, [LoadedConfig, ConfigEnv]>;
