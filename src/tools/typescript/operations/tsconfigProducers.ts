import { produceTsconfigBuildInfo } from "#tools/typescript/operations/produceTsconfigBuildInfo";
import { produceTsconfigExclude } from "#tools/typescript/operations/produceTsconfigExclude";
import { produceTsconfigExtends } from "#tools/typescript/operations/produceTsconfigExtends";
import { produceTsconfigInclude } from "#tools/typescript/operations/produceTsconfigInclude";
import { produceTsconfigLibrary } from "#tools/typescript/operations/produceTsconfigLibrary";
import { produceTsconfigModule } from "#tools/typescript/operations/produceTsconfigModule";
import { produceTsconfigOutDir } from "#tools/typescript/operations/produceTsconfigOutDir";
import { produceTsconfigPaths } from "#tools/typescript/operations/produceTsconfigPaths";
import { produceTsconfigSkipLibraryCheck } from "#tools/typescript/operations/produceTsconfigSkipLibraryCheck";
import { produceTsconfigSolution } from "#tools/typescript/operations/produceTsconfigSolution";
import { produceTsconfigTarget } from "#tools/typescript/operations/produceTsconfigTarget";
import { produceTsconfigTypes } from "#tools/typescript/operations/produceTsconfigTypes";
import type { TsconfigProducer } from "#project/tsconfig/index";

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
