import { boolean } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { defaultDefines } from "#project/config/constants";

export function declareDefines(name: keyof typeof defaultDefines) {
  return declare(boolean(), {
    description: `Whether the ${name} tsconfig includes the env file declaring the \`define.values\` globals.`,
    optional: { value: defaultDefines[name] },
  });
}
