import type { tsconfigEnvironments } from "#project/config/constants";

export type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];
