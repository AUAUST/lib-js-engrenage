import type { tsconfigEnvironments } from "#config/constants";

export type TsconfigKey = (typeof tsconfigEnvironments)[number] | "tests.dist";
