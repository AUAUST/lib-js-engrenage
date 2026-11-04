import { produceTsconfigBuildInfo } from "#typescript/setup/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#typescript/setup/produceTsconfigExclude";
import { produceTsconfigExtends } from "#typescript/setup/produceTsconfigExtends";
import { produceTsconfigInclude } from "#typescript/setup/produceTsconfigInclude";
import { produceTsconfigLibrary } from "#typescript/setup/produceTsconfigLibrary";
import { produceTsconfigModule } from "#typescript/setup/produceTsconfigModule";
import { produceTsconfigOutDir } from "#typescript/setup/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#typescript/setup/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#typescript/setup/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#typescript/setup/produceTsconfigSolution";
import { produceTsconfigTarget } from "#typescript/setup/produceTsconfigTarget";
import { produceTsconfigTypes } from "#typescript/setup/produceTsconfigTypes";
import type { TsconfigProducer } from "#typescript/types/TsconfigProducer";

// @debt most producers open with the same `key === "base"` early return; splitting base and environment producers (or declaring which targets a producer applies to) would remove the repeated guard
export const tsconfigProducers: readonly TsconfigProducer[] = [
  produceTsconfigExtends,
  produceTsconfigInclude,
  produceTsconfigExclude,
  produceTsconfigModule,
  produceTsconfigPaths,
  produceTsconfigSolution,
  produceTsconfigBuildInfo,
  produceTsconfigOutDir,
  produceTsconfigSkipLibraryCheck,
  produceTsconfigTarget,
  produceTsconfigLibrary,
  produceTsconfigTypes,
];
