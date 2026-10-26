import type { AttwOptions } from "tsdown";

import { freeze } from "@auaust/toolkit/object";

export const attwOptions = freeze({
  profile: "node16",
  ignoreRules: ["cjs-resolves-to-esm"],
} as const satisfies AttwOptions);
