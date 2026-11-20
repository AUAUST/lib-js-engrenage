import { toArray, toDeduplicated } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import type { ReexportMode } from "#batiment/roles/index";

export function listReexportModes(
  reexport: ReexportMode | readonly ReexportMode[],
): readonly ReexportMode[] {
  return freeze(toDeduplicated(toArray(reexport)));
}
