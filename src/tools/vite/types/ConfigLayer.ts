import type { AsyncFn } from "@auaust/toolkit/types";

import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";

export type ConfigLayer = AsyncFn<Config, [LoadedConfig, ConfigEnv]>;
