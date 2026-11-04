import type { AsyncFn } from "@auaust/toolkit/types";

import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";

export type ConfigLayer = AsyncFn<Config, [ResolvedConfig, ConfigEnv]>;
