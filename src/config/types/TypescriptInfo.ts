import type { Directory } from "#types/Directory";
import type { Paths } from "#typescript/types/Paths";

export interface TypescriptInfo {
  outDir?: Directory;
  paths?: Paths;
}
