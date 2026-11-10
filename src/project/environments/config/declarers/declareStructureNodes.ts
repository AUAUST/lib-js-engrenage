import {
  array,
  boolean,
  lazy,
  picklist,
  string,
  union,
  type GenericSchema,
} from "valibot";

import { freeze } from "@auaust/toolkit/object";

import {
  declare,
  declareObject,
  declareRecord,
  type Declaration,
} from "#foundation/options/index";
import { structureKeySchema } from "#project/environments/config/schemas/structureKeySchema";
import { roleSchema } from "#project/roles/index";
import type { DomainDeclaration } from "#project/environments/types/DomainDeclaration";
import type { NamespaceDeclaration } from "#project/environments/types/NamespaceDeclaration";

type NodeDeclaration<Output> = Declaration<unknown, Output, unknown>;

function refer<Output>(
  target: () => NodeDeclaration<Output>,
): NodeDeclaration<Output> {
  function resolve(input: unknown, context: unknown, path: string): Output {
    return target().resolve(input, context, path);
  }

  return freeze({
    schema: lazy((): GenericSchema => target().schema),
    resolve,
  });
}

function declareChildren() {
  return {
    namespaces: declareRecord(
      structureKeySchema,
      refer((): NodeDeclaration<NamespaceDeclaration> => namespaceNode),
      {
        description:
          "Namespaces inside this node, keyed by directory name relative to it.",
        optional: {
          value: {},
        },
      },
    ),
    domains: declareRecord(
      structureKeySchema,
      refer((): NodeDeclaration<DomainDeclaration> => domainNode),
      {
        description: [
          "Domains inside this node, keyed by directory name or one-segment glob relative to it.",
          "A name also makes a directory a domain, even a role-named one; a glob only adds metadata to the domains it matches.",
        ],
        optional: {
          value: {},
        },
      },
    ),
  };
}

// @debt the root `structure` needs the optionality, so child records also accept `undefined` values, resolved as empty namespaces
const namespaceNode = declareObject(
  {
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
        enable: declare(array(union([string(), roleSchema.schema])), {
          description:
            "Scoped roles to turn on for the whole subtree of the namespace, each the name of a role of the environment or a role of its own.",
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
    ...declareChildren(),
  },
  {
    description: [
      "A grouping directory: no `index.ts` and no roles, it holds domains and namespaces and orders them with `layers`.",
      "An environment's `structure` is its root namespace, the environment directory itself.",
    ],
    optional: {
      explain: "an empty namespace, so the tree is inferred",
      compute() {
        return {};
      },
    },
  },
);

const domainNode = declareObject({
  specifier: declare(string(), {
    description:
      "Public specifier of the domain, overriding the one derived from its path.",
    optional: { value: undefined },
  }),
  purpose: declare(string(), {
    description: "One line stating the domain's concern.",
    optional: { value: undefined },
  }),
  internals: declare(boolean(), {
    description: "Overrides `structure.internals` for this domain.",
    optional: { value: undefined },
  }),
  ...declareChildren(),
});

const nodes = freeze({ namespace: namespaceNode, domain: domainNode });

export function declareStructureNodes() {
  return nodes;
}
