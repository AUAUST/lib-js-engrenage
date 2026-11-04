import { produceTsconfigBuildInfo } from "#tsconfig/setup/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#tsconfig/setup/produceTsconfigExclude";
import { produceTsconfigExtends } from "#tsconfig/setup/produceTsconfigExtends";
import { produceTsconfigInclude } from "#tsconfig/setup/produceTsconfigInclude";
import { produceTsconfigLibrary } from "#tsconfig/setup/produceTsconfigLibrary";
import { produceTsconfigModule } from "#tsconfig/setup/produceTsconfigModule";
import { produceTsconfigOutDir } from "#tsconfig/setup/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#tsconfig/setup/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#tsconfig/setup/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#tsconfig/setup/produceTsconfigSolution";
import { produceTsconfigTarget } from "#tsconfig/setup/produceTsconfigTarget";
import { produceTsconfigTypes } from "#tsconfig/setup/produceTsconfigTypes";
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
