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
import { reexportSchema, roleSchema } from "#project/roles/index";
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
        description: "Namespaces inside this node, keyed by directory name relative to it.",
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

const fields = freeze({
  layers: declare(array(string()), {
    description: "Order of the namespace's children, lowest first, with `*` for every child not listed. Unset, the children are unordered peers.",
    optional: { value: undefined },
  }),
  relation: declare(picklist(["peers", "isolated"]), {
    description: "How children of one layer reach each other: `peers` through their `index.ts`, or `isolated`, never. Children of a namespace without `layers` all count as one layer. Unset, `peers`.",
    optional: { value: undefined },
  }),
  children: declare(picklist(["domains"]), {
    description: "What every child directory of the namespace is: `domains` makes each one a domain, without an `index.ts` or a `domains` entry. Unset, children are classified from their contents.",
    optional: { value: undefined },
  }),
  namespacePurpose: declare(string(), {
    description: "One line stating what the namespace groups.",
    optional: { value: undefined },
  }),
  domainPurpose: declare(string(), {
    description: "One line stating the domain's concern.",
    optional: { value: undefined },
  }),
  specifier: declare(string(), {
    description: "Public specifier of the domain, overriding the one derived from its path.",
    optional: { value: undefined },
  }),
  internals: declare(boolean(), {
    description: "Overrides `structure.internals` for this domain.",
    optional: { value: undefined },
  }),
  reexport: declare(reexportSchema, {
    description: "How the environment's generated root entry re-exports the domain's entry: as a `namespace` named after its package subpath, `flat`, its names spread among the root's, or both as a list. Unset, `namespace`.",
    optional: { value: undefined },
  }),
  public: declare(boolean(), {
    description: "Whether the domain is a package entry, so `engrenage sync` creates the `entry.ts` of a domain without `index.ts`. Unset, whether its `entry.ts` exists; `false` fails when it does.",
    optional: { value: undefined },
  }),
});

// @debt the root `structure` needs the optionality, so child records also accept `undefined` values, resolved as empty namespaces
const namespaceNode = declareObject(
  {
    layers: fields.layers,
    relation: fields.relation,
    children: fields.children,
    purpose: fields.namespacePurpose,
    roles: declareObject(
      {
        enable: declare(array(union([string(), roleSchema.schema])), {
          description: "Scoped roles to turn on for the whole subtree of the namespace, each the name of a role of the environment or a role of its own.",
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
  specifier: fields.specifier,
  purpose: fields.domainPurpose,
  internals: fields.internals,
  reexport: fields.reexport,
  public: fields.public,
  ...declareChildren(),
});

const nodes = freeze({
  namespace: namespaceNode,
  domain: domainNode,
  fields,
});

export function declareStructureNodes() {
  return nodes;
}
