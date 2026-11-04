import type { ConfigObject } from "#tools/eslint/types/ConfigObject";

export type ConfigWithExtends = ConfigObject | ConfigWithExtends[];
