import { picklist, string } from "valibot";

import { declare } from "#foundation/options/index";

const domainsLayout = "domains";

interface LayoutContext {
  readonly layouts: readonly string[];
  readonly layout: string | undefined;
}

export function declareLayout() {
  return declare(string(), {
    description: [
      "The layout shaping the environment's tree, by name: one the `layouts` slot holds, or `domains` for the namespace and domain walk.",
      "`commands` makes the environment root and every directory that is not a role a command group: its `index.ts` names its subcommands and their aliases, the root group's `executable.ts` runs it, and each other module is one command.",
    ],
    schema(context: LayoutContext) {
      return picklist([domainsLayout, ...context.layouts]);
    },
    optional: {
      explain: "the layout of the environment's kind, otherwise `domains`",
      compute(context: LayoutContext) {
        return context.layout ?? domainsLayout;
      },
    },
  });
}
