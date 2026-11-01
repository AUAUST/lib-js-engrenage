import { produceTsconfigExclude } from "#typescript/setup/produceTsconfigExclude";
import { produceTsconfigExtends } from "#typescript/setup/produceTsconfigExtends";
import { produceTsconfigInclude } from "#typescript/setup/produceTsconfigInclude";
import { produceTsconfigPaths } from "#typescript/setup/produceTsconfigPaths";
import type { TsconfigProducer } from "#typescript/types/TsconfigProducer";

export const tsconfigProducers: readonly TsconfigProducer[] = [
  produceTsconfigExtends,
  produceTsconfigInclude,
  produceTsconfigExclude,
  produceTsconfigPaths,
];
