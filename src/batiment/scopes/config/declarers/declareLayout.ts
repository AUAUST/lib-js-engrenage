import { picklist, string } from "valibot";

import { declare, unset } from "#foundation/options/index";
import type { LayoutContext } from "#batiment/scopes/types/LayoutContext";

const domainsLayout = "domains";

export function declareLayout() {
  return declare(string(), {
    description: [
      "The layout shaping the environment's tree, by name: one the `layouts` slot holds, or `domains` for the namespace and domain walk.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` declares it, the root group's `executable.ts` runs it and `actions/` holds one action module per command; any other module holds a command, several or a group, which a group's `index.ts` declares or loads.",
      "`programs` makes every directory of the environment root a program a directory source mounts, whose `index.ts` default-exports it and whose optional `executable.ts` only hands it to nexus's `launch`, and every directory below that is not a role a command group, as `commands` shapes them.",
    ],
    schema(context: LayoutContext) {
      return picklist([domainsLayout, ...context.layouts]);
    },
    optional: unset(
      "the layout of the environment's namespace kind, otherwise `domains`",
    ),
  });
}
