import { boolean } from "valibot";

import { declare } from "#foundation/options/index";

export function declareDefines(name: string, defines: boolean) {
  return declare(boolean(), {
    description: `Whether the ${name} tsconfig includes the env file declaring the \`define.values\` globals.`,
    optional: { value: defines },
  });
}
