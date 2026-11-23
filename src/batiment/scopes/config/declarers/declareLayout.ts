import { picklist, string } from "valibot";

import { declare, unset } from "#foundation/options/index";
import type { LayoutContext } from "#batiment/scopes/types/LayoutContext";

const domainsLayout = "domains";

export function declareLayout() {
  return declare(string(), {
    description: [
      "The layout shaping the environment's tree, by name: one the `layouts` slot holds, or `domains` for the namespace and domain walk.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` names its subcommands and their aliases, the root group's `executable.ts` runs it, and each other module is one command.",
    ],
    schema(context: LayoutContext) {
      return picklist([domainsLayout, ...context.layouts]);
    },
    optional: unset(
      "the layout of the environment's namespace kind, otherwise `domains`",
    ),
  });
}
