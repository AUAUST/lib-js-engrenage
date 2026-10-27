import * as math from "@auaust/toolkit/math";
import { keys } from "@auaust/toolkit/object";

import { toolkit } from "#constants";
import { defineGlobalReplacement } from "#eslint/conventions/defineGlobalReplacement";

export default defineGlobalReplacement({
  global: "Math",
  properties: keys(math).filter((name) => {
    return name in Math;
  }),
  replacement: `the \`${toolkit}/math\` equivalent`,
  requires: [toolkit],
});
