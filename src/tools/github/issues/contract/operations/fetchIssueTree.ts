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
  type GithubAccess,
  type GithubClient,
} from "#tools/github/issues/api/index";
import { blockersField } from "#tools/github/issues/contract/constants";
import type { IssueTree } from "#tools/github/issues/contract/types/IssueTree";

const pageSize = 25;
const pageLimit = 100;
const nestedLevels = 2;
const ancestorLevels = 8;

const stateSchema = picklist(["OPEN", "CLOSED"]);

const numberedSchema = object({ number: number() });

const relatedSchema = object({ number: number(), state: stateSchema });

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

const fieldValueSelection = `... on IssueFieldMultiSelectValue {
  field { ... on IssueFieldMultiSelect { name } }
  options { name }
}`;

const issueSelection = `id number title body state issueType { name }
issueFieldValues(first: ${pageSize}) { ${pageInfo} nodes { ${fieldValueSelection} } }
blockedBy(first: ${pageSize}) { ${pageInfo} nodes { number state } }
subIssuesSummary { total }`;

function selectSubIssues(levels: number): string {
  return levels === 0
    ? issueSelection
    : `${issueSelection}
subIssues(first: ${pageSize}) { ${pageInfo} nodes { ${selectSubIssues(levels - 1)} } }`;
}

function selectAncestors(levels: number): string {
  return levels === 0
    ? "number issueType { name }"
    : `number issueType { name } parent { ${selectAncestors(levels - 1)} }`;
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

function readAncestors(parent: unknown, number: number): readonly number[] {
  const chain: number[] = [];

  let next = parent;

  while (next != null) {
    const ancestor = validate(ancestorSchema, next, `ancestors of #${number}`);

    chain.unshift(ancestor.number);

    if (ancestor.issueType?.name === "Plan") {
      break;
    }

    next = ancestor.parent;
  }

  return chain;
}

// @debt sub-issues and blocking issues from another repository are identified by their number alone, as in this repository
async function buildTree(
  access: GithubAccess,
  raw: unknown,
  parent: number | undefined,
): Promise<IssueTree> {
  const node = validate(issueSchema, raw, "issue tree");

  const label = `#${node.number}`;

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
      "number state",
      node.blockedBy,
    ),
    buildSubIssues(access, node),
  ]);

  const blockers = fieldValues
    .map((value) => validate(fieldValueSchema, value, `fields of ${label}`))
    .filter(({ field }) => field?.name === blockersField)
    .flatMap(({ options = [] }) => options.map(({ name }) => name));

  return {
    issue: {
      number: node.number,
      title: node.title,
      body: node.body ?? "",
      state: readState(node.state),
      type: node.issueType?.name,
      blockers,
      subIssues: subIssues.map(({ issue }) => {
        return { number: issue.number, state: issue.state };
      }),
      parent,
      blockedBy: blockedBy.map((related) => {
        const {
          number,
          state,
        } = validate(relatedSchema, related, `blockers of ${label}`);

        return { number, state: readState(state) };
      }),
    },
    subIssues,
  };
}

async function buildSubIssues(
  access: GithubAccess,
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
    "number",
    { ...node.subIssues, nodes: [] },
  );

  return Promise.all([
    ...fetched.map((raw) => buildTree(access, raw, node.number)),
    ...rest.map(async (raw) => {
      const child = validate(
        numberedSchema,
        raw,
        `sub-issues of #${node.number}`,
      );

      const { tree } = await fetchIssueTree(access, child.number);

      return tree;
    }),
  ]);
}

export async function fetchIssueTree(
  access: GithubAccess,
  number: number,
): Promise<{
  readonly tree: IssueTree;
  readonly ancestors: readonly number[];
}> {
  const { owner, repo } = splitRepository(access.repository);

  const response: unknown = await access.client.graphql(treeQuery, {
    owner,
    name: repo,
    number,
  });

  const raw = validate(treeSchema, response, `issue tree of #${number}`)
    .repository.issue;

  const ancestors = readAncestors(raw.parent, number);

  return {
    tree: await buildTree(access, raw, ancestors.at(-1)),
    ancestors,
  };
}
