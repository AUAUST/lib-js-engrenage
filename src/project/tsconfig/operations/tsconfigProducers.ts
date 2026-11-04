import { produceTsconfigBuildInfo } from "#tsconfig/operations/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#tsconfig/operations/produceTsconfigExclude";
import { produceTsconfigExtends } from "#tsconfig/operations/produceTsconfigExtends";
import { produceTsconfigInclude } from "#tsconfig/operations/produceTsconfigInclude";
import { produceTsconfigLibrary } from "#tsconfig/operations/produceTsconfigLibrary";
import { produceTsconfigModule } from "#tsconfig/operations/produceTsconfigModule";
import { produceTsconfigOutDir } from "#tsconfig/operations/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#tsconfig/operations/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#tsconfig/operations/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#tsconfig/operations/produceTsconfigSolution";
import { produceTsconfigTarget } from "#tsconfig/operations/produceTsconfigTarget";
import { produceTsconfigTypes } from "#tsconfig/operations/produceTsconfigTypes";
import type { TsconfigProducer } from "#tsconfig/types/TsconfigProducer";

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
