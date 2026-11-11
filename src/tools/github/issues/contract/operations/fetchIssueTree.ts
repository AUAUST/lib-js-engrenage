import {
  array,
  boolean,
  looseObject,
  nullable,
  nullish,
  number,
  object,
  optional,
  picklist,
  string,
  unknown,
  type GenericSchema,
  type InferOutput,
} from "valibot";

import { validate } from "#foundation/options/index";
import {
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueTree } from "#tools/github/issues/contract/types/IssueTree";

const pageSize = 25;
const pageLimit = 100;
const nestedLevels = 2;
const ancestorLevels = 8;

const stateSchema = picklist(["OPEN", "CLOSED"]);

const repositorySchema = object({ nameWithOwner: string() });

const locatedSchema = object({
  number: number(),
  repository: repositorySchema,
});

const relatedSchema = object({
  number: number(),
  state: stateSchema,
  repository: repositorySchema,
});

const fieldValueSchema = object({
  field: nullish(object({ name: optional(string()) })),
  options: optional(array(object({ name: string() }))),
});

function connectionSchema<Node extends GenericSchema>(node: Node) {
  return object({
    pageInfo: object({
      hasNextPage: boolean(),
      endCursor: nullable(string()),
    }),
    nodes: array(node),
  });
}

const issueSchema = object({
  id: string(),
  number: number(),
  repository: repositorySchema,
  title: string(),
  body: nullish(string()),
  state: stateSchema,
  issueType: nullable(object({ name: string() })),
  issueFieldValues: connectionSchema(fieldValueSchema),
  blockedBy: connectionSchema(relatedSchema),
  subIssuesSummary: object({ total: number() }),
  subIssues: optional(connectionSchema(unknown())),
});

const ancestorSchema = object({
  number: number(),
  repository: repositorySchema,
  issueType: nullable(object({ name: string() })),
  parent: nullish(unknown()),
});

const treeSchema = object({
  repository: object({
    issue: looseObject({ parent: nullish(unknown()) }),
  }),
});

const nodeSchema = object({
  node: object({ connection: connectionSchema(unknown()) }),
});

const pageInfo = "pageInfo { hasNextPage endCursor }";

const locationSelection = "number repository { nameWithOwner }";

const relatedSelection = `${locationSelection} state`;

const fieldValueSelection = `... on IssueFieldMultiSelectValue {
  field { ... on IssueFieldMultiSelect { name } }
  options { name }
}`;

const issueSelection = `id ${locationSelection} title body state issueType { name }
issueFieldValues(first: ${pageSize}) { ${pageInfo} nodes { ${fieldValueSelection} } }
blockedBy(first: ${pageSize}) { ${pageInfo} nodes { ${relatedSelection} } }
subIssuesSummary { total }`;

function selectSubIssues(levels: number): string {
  return levels === 0
    ? issueSelection
    : `${issueSelection}
subIssues(first: ${pageSize}) { ${pageInfo} nodes { ${selectSubIssues(levels - 1)} } }`;
}

function selectAncestors(levels: number): string {
  return levels === 0
    ? `${locationSelection} issueType { name }`
    : `${locationSelection} issueType { name } parent { ${selectAncestors(levels - 1)} }`;
}

const treeQuery = `query ($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      ${selectSubIssues(nestedLevels)}
      parent { ${selectAncestors(ancestorLevels - 1)} }
    }
  }
}`;

function readState(state: "OPEN" | "CLOSED") {
  return state === "OPEN" ? "open" : "closed";
}

async function readConnection(
  client: GithubClient,
  id: string,
  name: string,
  selection: string,
  page: {
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly endCursor: string | null;
    };
    readonly nodes: readonly unknown[];
  },
): Promise<readonly unknown[]> {
  const nodes = [...page.nodes];

  let after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;

  while (after !== null) {
    const response: unknown = await client.graphql(
      `query ($id: ID!, $after: String) {
        node(id: $id) {
          ... on Issue {
            connection: ${name}(first: ${pageLimit}, after: $after) { ${pageInfo} nodes { ${selection} } }
          }
        }
      }`,
      { id, after },
    );

    const {
      connection,
    } = validate(nodeSchema, response, `${name} of ${id}`).node;

    nodes.push(...connection.nodes);

    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null;
  }

  return nodes;
}

function readAncestors(
  parent: unknown,
  label: string,
  plan: string,
): readonly IssueLocation[] {
  const chain: IssueLocation[] = [];

  let next = parent;

  while (next != null) {
    const ancestor = validate(ancestorSchema, next, `ancestors of ${label}`);

    chain.unshift({
      repository: ancestor.repository.nameWithOwner,
      number: ancestor.number,
    });

    if (ancestor.issueType?.name === plan) {
      break;
    }

    next = ancestor.parent;
  }

  return chain;
}

async function buildTree(
  access: IssueAccess,
  raw: unknown,
  parent: IssueLocation | undefined,
): Promise<IssueTree> {
  const node = validate(issueSchema, raw, "issue tree");

  const repository = node.repository.nameWithOwner;

  const label = `${repository}#${node.number}`;

  const [fieldValues, blockedBy, subIssues] = await Promise.all([
    readConnection(
      access.client,
      node.id,
      "issueFieldValues",
      fieldValueSelection,
      node.issueFieldValues,
    ),
    readConnection(
      access.client,
      node.id,
      "blockedBy",
      relatedSelection,
      node.blockedBy,
    ),
    buildSubIssues({ ...access, repository }, node),
  ]);

  const blockers = fieldValues
    .map((value) => validate(fieldValueSchema, value, `fields of ${label}`))
    .filter(({ field }) => field?.name === access.protocol.fields.blockers)
    .flatMap(({ options = [] }) => options.map(({ name }) => name));

  return {
    repository,
    issue: {
      number: node.number,
      title: node.title,
      body: node.body ?? "",
      state: readState(node.state),
      type: node.issueType?.name,
      blockers,
      subIssues: subIssues.map((sub) => {
        return {
          repository: sub.repository,
          number: sub.issue.number,
          state: sub.issue.state,
        };
      }),
      parent,
      blockedBy: blockedBy.map((related) => {
        const blocker = validate(
          relatedSchema,
          related,
          `blockers of ${label}`,
        );

        return {
          repository: blocker.repository.nameWithOwner,
          number: blocker.number,
          state: readState(blocker.state),
        };
      }),
    },
    subIssues,
  };
}

async function buildSubIssues(
  access: IssueAccess,
  node: InferOutput<typeof issueSchema>,
): Promise<readonly IssueTree[]> {
  if (node.subIssues === undefined) {
    if (node.subIssuesSummary.total === 0) {
      return [];
    }

    const { tree } = await fetchIssueTree(access, node.number);

    return tree.subIssues;
  }

  const fetched = node.subIssues.nodes;

  const rest = await readConnection(
    access.client,
    node.id,
    "subIssues",
    locationSelection,
    { ...node.subIssues, nodes: [] },
  );

  const parent = { repository: access.repository, number: node.number };

  return Promise.all([
    ...fetched.map((raw) => buildTree(access, raw, parent)),
    ...rest.map(async (raw) => {
      const child = validate(
        locatedSchema,
        raw,
        `sub-issues of ${access.repository}#${node.number}`,
      );

      const { tree } = await fetchIssueTree(
        { ...access, repository: child.repository.nameWithOwner },
        child.number,
      );

      return tree;
    }),
  ]);
}

export async function fetchIssueTree(
  access: IssueAccess,
  number: number,
): Promise<{
  readonly tree: IssueTree;
  readonly ancestors: readonly IssueLocation[];
}> {
  const { owner, repo } = splitRepository(access.repository);

  const response: unknown = await access.client.graphql(treeQuery, {
    owner,
    name: repo,
    number,
  });

  const label = `${access.repository}#${number}`;

  const raw = validate(treeSchema, response, `issue tree of ${label}`)
    .repository.issue;

  const ancestors = readAncestors(
    raw.parent,
    label,
    access.protocol.types.plan,
  );

  return {
    tree: await buildTree(access, raw, ancestors.at(-1)),
    ancestors,
  };
}
