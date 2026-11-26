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

import { reexportSchema, roleSchema } from "#batiment/roles/index";
import { declareNamespaceKind } from "#batiment/scopes/config/declarers/declareNamespaceKind";
import { debtSchema } from "#batiment/scopes/config/schemas/debtSchema";
import { namespaceImportsSchema } from "#batiment/scopes/config/schemas/namespaceImportsSchema";
import { schemaReferenceSchema } from "#batiment/scopes/config/schemas/schemaReferenceSchema";
import { structureKeySchema } from "#batiment/scopes/config/schemas/structureKeySchema";
import {
  declare,
  declareObject,
  declareRecord,
  unset,
  type Declaration,
} from "#foundation/options/index";
import type { DomainDeclaration } from "#batiment/scopes/types/DomainDeclaration";
import type { NamespaceDeclaration } from "#batiment/scopes/types/NamespaceDeclaration";

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

const namespaceFields = freeze({
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
  purpose: declare(string(), {
    description: "One line stating what the namespace groups.",
    optional: { value: undefined },
  }),
  debt: debtSchema,
});

// @debt `specifier`, `reexport`, `public`, `collects` and `publicRoles` are JavaScript package fields, split out with the language port (#740)
const domainFields = freeze({
  specifier: declare(string(), {
    description: "Public specifier of the domain, overriding the one derived from its path.",
    optional: { value: undefined },
  }),
  purpose: declare(string(), {
    description: "One line stating the domain's concern.",
    optional: { value: undefined },
  }),
  debt: debtSchema,
  internals: declare(boolean(), {
    description: "Overrides `structure.internals` for this domain.",
    optional: { value: undefined },
  }),
  reexport: declare(reexportSchema, {
    description: "How the environment's generated root entry re-exports the domain's entry: as a `namespace` named after its package subpath, `flat`, its names spread among the root's, or both as a list. Unset, `namespace`.",
    optional: { value: undefined },
  }),
  collects: declare(array(string()), {
    description: "Roles whose collected modules, from every domain of the environment, the domain's generated entry re-exports besides its own modules. Each must be a public collected role of the environment.",
    optional: { value: undefined },
  }),
  publicRoles: declare(array(string()), {
    description: "Roles whose modules, in this domain and its sub-domains only, other domains and workspaces import one by one, as they do a public role's. Each must be a role of the environment.",
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
    ...namespaceFields,
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
  ...domainFields,
  ...declareChildren(),
});

const nodes = freeze({
  namespace: namespaceNode,
  domain: domainNode,
  metadata: freeze({
    namespace: declareObject({
      $schema: schemaReferenceSchema,
      kind: declareNamespaceKind(
        "its config `kind` at the root, its directory name in a workspace; ignored below a top-level namespace",
      ),
      imports: declare(namespaceImportsSchema, {
        description: [
          "Top-level namespaces of the same scope the top-level namespace imports besides its kind's `imports`, by name, with a relation: `whole` any file, `surface` only a domain's `index`, `entry` and public roles.",
          "A relation stronger than its kind's replaces it; the target kind's `inward` caps it, and a sealed target is reported and ignored.",
          "`{ relation, dirs }` reaches only the listed directories of the target, relative to the scope, whatever grants its kind's `imports` give; a directory the target does not span is reported and ignored.",
        ],
        optional: unset(
          "only its kind's `imports`; ignored below a top-level namespace",
        ),
      }),
      ...namespaceFields,
      roles: declareObject(
        {
          enable: declare(array(string()), {
            description: "Roles of the environment to turn on for the whole subtree of the namespace, by name.",
          }),
        },
        {
          description: "Scoped roles the namespace enables. In a directory of a namespace spanning several, the only place that directory's roles are enabled.",
          optional: true,
        },
      ),
    }),
    domain: declareObject({ $schema: schemaReferenceSchema, ...domainFields }),
  }),
});

export function declareStructureNodes() {
  return nodes;
}
