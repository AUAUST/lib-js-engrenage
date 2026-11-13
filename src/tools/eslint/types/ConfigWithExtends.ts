import type { ConfigObject } from "#tools/eslint/types/ConfigObject";

/**
 * A config object, or nested arrays of them, flattened in order.
 */
export type ConfigWithExtends = ConfigObject | ConfigWithExtends[];
