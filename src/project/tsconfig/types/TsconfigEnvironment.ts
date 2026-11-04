import type { tsconfigEnvironments } from "#config/constants";

export type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];
