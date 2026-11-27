import { picklist, string } from "valibot";

import { declare, unset } from "#foundation/options/index";
import type { LayoutContext } from "#batiment/scopes/types/LayoutContext";

const domainsLayout = "domains";

export function declareLayout() {
  return declare(string(), {
    description: [
      "The layout shaping the environment's tree, by name: one the `layouts` slot holds, or `domains` for the namespace and domain walk.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` declares its commands, each loading its own action module from `actions/`, and may mount commands another group's `index.ts` exports; the root group's `executable.ts` runs it; a group holds no other module.",
    ],
    schema(context: LayoutContext) {
      return picklist([domainsLayout, ...context.layouts]);
    },
    optional: unset(
      "the layout of the environment's namespace kind, otherwise `domains`",
    ),
  });
}
