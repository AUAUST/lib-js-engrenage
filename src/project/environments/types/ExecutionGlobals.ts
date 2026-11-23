import type { executionGlobals } from "#project/environments/constants";

/**
 * The host whose globals an environment's code reaches: `isomorphic` for code
 * any runtime hosts, `browser` for code only browsers host, `node` for Node.
 */
export type ExecutionGlobals = (typeof executionGlobals)[number];
