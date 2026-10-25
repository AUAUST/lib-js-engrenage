import type { Directory } from "#types/Directory";
import type { Paths } from "#typescript/types/Paths";

export interface TsconfigInfo {
  outDir?: Directory;
  paths?: Paths;
}
