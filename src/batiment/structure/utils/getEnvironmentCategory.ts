import { sourceEnvironment } from "#batiment/structure/constants";
import type { ImportCategory } from "#batiment/structure/types/ImportCategory";

export function getEnvironmentCategory(environment: string): ImportCategory {
  return environment === sourceEnvironment ? "internal-aliases" : environment;
}
