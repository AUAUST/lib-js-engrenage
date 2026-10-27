import type { ConfigObject } from "#eslint/types/ConfigObject";

export type ConfigWithExtends = ConfigObject | ConfigWithExtends[];
