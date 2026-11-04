import { produceTsconfigBuildInfo } from "#project/tsconfig/operations/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#project/tsconfig/operations/produceTsconfigExclude";
import { produceTsconfigExtends } from "#project/tsconfig/operations/produceTsconfigExtends";
import { produceTsconfigInclude } from "#project/tsconfig/operations/produceTsconfigInclude";
import { produceTsconfigLibrary } from "#project/tsconfig/operations/produceTsconfigLibrary";
import { produceTsconfigModule } from "#project/tsconfig/operations/produceTsconfigModule";
import { produceTsconfigOutDir } from "#project/tsconfig/operations/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#project/tsconfig/operations/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#project/tsconfig/operations/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#project/tsconfig/operations/produceTsconfigSolution";
import { produceTsconfigTarget } from "#project/tsconfig/operations/produceTsconfigTarget";
import { produceTsconfigTypes } from "#project/tsconfig/operations/produceTsconfigTypes";
import type { TsconfigProducer } from "#project/tsconfig/types/TsconfigProducer";

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
