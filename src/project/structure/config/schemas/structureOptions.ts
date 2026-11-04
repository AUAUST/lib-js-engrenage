import { array, boolean, picklist, string, union } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { declareObject } from "#foundation/options/utils/declareObject";
import { declareRecord } from "#foundation/options/utils/declareRecord";
import { directorySchema } from "#project/config/config/schemas/values/directorySchema";
import { globSchema } from "#project/config/config/schemas/values/globsSchema";
import { inlineRoleSchema } from "#project/structure/config/schemas/inlineRoleSchema";

export const structureOptions = {
  namespaces: declareRecord(
    directorySchema,
    declareObject({
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
    }),
    {
      description: [
        "Grouping directories, by path relative to the environment directory (`.` is the environment directory itself).",
        "A namespace has no `index.ts` and no roles, holds domains and namespaces, and orders them with `layers`.",
      ],
      optional: {
        explain: "none, so namespaces are inferred",
        compute() {
          return {};
        },
      },
    },
  ),
  domains: declareRecord(
    globSchema,
    declareObject({
      public: declare(boolean(), {
        description: "Whether the domain is part of the package's public API.",
        optional: { value: false },
      }),
      specifier: declare(string(), {
        description:
          "Public specifier of the domain, overriding the one derived from its path.",
        optional: { value: undefined },
      }),
      purpose: declare(string(), {
        description: "One line stating the domain's concern.",
        optional: { value: undefined },
      }),
    }),
    {
      description: [
        "Metadata of domains, by path or glob relative to the environment directory.",
        "A path declaration also makes a directory a domain, even a role-named one; a glob only adds metadata.",
      ],
      optional: {
        value: {},
      },
    },
  ),
  optOut: declare(array(directorySchema), {
    description:
      "Directories, relative to the environment directory, that are never read as roles even though their name is one.",
    optional: { value: [] },
  }),
  strictness: declare(picklist(["strict", "loose"]), {
    description:
      "`strict` expects every directory to be classified; under `loose`, unclassified directories count as plain domains.",
    optional: { value: "strict" },
  }),
};
