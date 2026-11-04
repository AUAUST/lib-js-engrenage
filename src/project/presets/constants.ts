import { freeze } from "@auaust/toolkit/object";

import type { Globs } from "#types/Globs";

export const presets = freeze(["library"] as const) satisfies Globs;
