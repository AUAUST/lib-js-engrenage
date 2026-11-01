import { produceTsconfigBuildInfo } from "#typescript/setup/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#typescript/setup/produceTsconfigExclude";
import { produceTsconfigExtends } from "#typescript/setup/produceTsconfigExtends";
import { produceTsconfigInclude } from "#typescript/setup/produceTsconfigInclude";
import { produceTsconfigOutDir } from "#typescript/setup/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#typescript/setup/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#typescript/setup/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#typescript/setup/produceTsconfigSolution";
import type { TsconfigProducer } from "#typescript/types/TsconfigProducer";

export const tsconfigProducers: readonly TsconfigProducer[] = [
  produceTsconfigExtends,
  produceTsconfigInclude,
  produceTsconfigExclude,
  produceTsconfigPaths,
  produceTsconfigSolution,
  produceTsconfigBuildInfo,
  produceTsconfigOutDir,
  produceTsconfigSkipLibraryCheck,
];
