import { array, picklist, string, union } from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { inlineRoleSchema } from "#project/structure/config/schemas/inlineRoleSchema";

export const namespaceSchema = declareObject({
  layers: declare(array(string()), {
    description:
      "Order of the namespace's children, lowest first, with `*` for every child not listed. Unset, the children are unordered peers.",
    optional: { value: undefined },
  }),
  relation: declare(picklist(["peers", "isolated"]), {
    description:
      "How children of one layer reach each other: `peers` through their `index.ts`, or `isolated`, never. Children of a namespace without `layers` all count as one layer.",
    optional: { value: "peers" },
  }),
  purpose: declare(string(), {
    description: "One line stating what the namespace groups.",
    optional: { value: undefined },
  }),
  roles: declareObject(
    {
      enable: declare(array(union([string(), inlineRoleSchema.schema])), {
        description:
          "Scoped roles to turn on for the whole subtree of the namespace, each a registered name or an inline contract with its `name`.",
      }),
    },
    {
      optional: {
        explain: "none",
        compute() {
          return { enable: [] };
        },
      },
    },
  ),
});
