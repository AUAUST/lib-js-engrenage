import { produceTsconfigExtends } from "#typescript/setup/produceTsconfigExtends";
import type { TsconfigProducer } from "#typescript/types/TsconfigProducer";

export const tsconfigProducers: readonly TsconfigProducer[] = [
  produceTsconfigExtends,
];
