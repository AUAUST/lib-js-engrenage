import type { tsconfigEnvironments } from "#project/tsconfig/constants";

export type TsconfigEnvironment = (typeof tsconfigEnvironments)[number];
