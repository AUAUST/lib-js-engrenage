import type { AsyncFn } from "@auaust/toolkit/types";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#vite/types/Config";
import type { ConfigEnv } from "#vite/types/ConfigEnv";

export type ConfigLayer = AsyncFn<Config, [ResolvedConfig, ConfigEnv]>;
