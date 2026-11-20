import type { MaybePromise } from "@auaust/toolkit/types";

import type { StructureNode } from "#batiment/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";

/**
 * @experimental
 */
export type BarrelExportsResolver = (
  node: StructureNode,
  exports: readonly BarrelExport[],
  config: LoadedConfig,
) => MaybePromise<readonly BarrelExport[]>;
