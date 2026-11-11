import { toDeduplicated, wrap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import type { ReexportMode } from "#project/roles/index";

export function listReexportModes(
  reexport: ReexportMode | readonly ReexportMode[],
): readonly ReexportMode[] {
  return freeze(toDeduplicated(wrap(reexport)));
}
