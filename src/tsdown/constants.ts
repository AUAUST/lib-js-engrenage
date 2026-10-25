import { freeze } from "@auaust/toolkit/object";
import type { AttwOptions } from "tsdown";

export const attwOptions = freeze({
  profile: "node16",
  ignoreRules: ["cjs-resolves-to-esm"],
} satisfies AttwOptions);
