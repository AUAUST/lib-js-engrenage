import {
  array,
  nullish,
  number,
  object,
  picklist,
  string,
  union,
  type InferOutput,
} from "valibot";

import { isArray } from "@auaust/toolkit/isArray";
import { record } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import {
  isMissingResource,
  readApiRepository,
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { FetchedIssue } from "#tools/github/issues/contract/types/FetchedIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";

const stateSchema = picklist(["open", "closed"]);

const relatedSchema = array(
  object({
    id: number(),
    number: number(),
    state: stateSchema,
    repository_url: string(),
  }),
);

function toRelated(
  related: InferOutput<typeof relatedSchema>,
): FetchedIssue["subIssues"] {
  return related.map(({ id, number, state, repository_url }) => {
    return {
      id,
      number,
      state,
      repository: readApiRepository(repository_url),
    };
  });
}

const issueSchema = object({
  id: number(),
  node_id: string(),
  number: number(),
  title: string(),
  body: nullish(string()),
  state: stateSchema,
  state_reason: nullish(string()),
  type: nullish(object({ name: string() })),
  labels: nullish(array(object({ name: string() })), []),
});

const namedSchema = object({ name: string() });

const fieldValuesSchema = array(
  object({
    issue_field_name: string(),
    value: nullish(union([string(), number()])),
    single_select_option: nullish(namedSchema),
    multi_select_options: nullish(array(namedSchema)),
  }),
);

function readFieldValue({
  value,
  single_select_option,
  multi_select_options,
}: InferOutput<typeof fieldValuesSchema>[number]) {
  if (multi_select_options != null) {
    return multi_select_options.map(({ name }) => name);
  }

  return single_select_option?.name ?? value ?? undefined;
}

const parentSchema = object({
  number: number(),
  repository_url: string(),
});

function readParent({
  number,
  repository_url,
}: InferOutput<typeof parentSchema>) {
  return { repository: readApiRepository(repository_url), number };
}

async function fetchParent(
  client: GithubClient,
  issue: { owner: string; repo: string; issue_number: number },
) {
  try {
    const { data } = await client.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/parent",
      issue,
    );

    return data;
  } catch (error) {
    if (isMissingResource(error)) {
      return;
    }

    throw error;
  }
}

export async function fetchIssue(
  { repository, client, protocol }: IssueAccess,
  number: number,
): Promise<FetchedIssue> {
  const route = {
    ...splitRepository(repository),
    issue_number: number,
  };

  const [issue, fields, subIssues, parent, blockedBy] = await Promise.all([
    client.request("GET /repos/{owner}/{repo}/issues/{issue_number}", route),
    client.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values",
      route,
    ),
    client.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      route,
    ),
    fetchParent(client, route),
    client.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by",
      route,
    ),
  ]);

  const checked = validate(issueSchema, issue.data, `issue #${number}`);

  const values = new Map(
    validate(fieldValuesSchema, fields, `fields of #${number}`).flatMap(
      (field) => {
        const value = readFieldValue(field);

        return value === undefined
          ? []
          : [[field.issue_field_name, value] as const];
      },
    ),
  );

  const blockers = values.get(protocol.fields.blockers);

  return {
    id: checked.id,
    nodeId: checked.node_id,
    number: checked.number,
    title: checked.title,
    body: checked.body ?? "",
    state: checked.state,
    stateReason: checked.state_reason ?? undefined,
    type: checked.type?.name,
    labels: checked.labels.map(({ name }) => name),
    fields: record([...values]),
    blockers: isArray(blockers) ? blockers : [],
    subIssues: toRelated(
      validate(relatedSchema, subIssues, `sub-issues of #${number}`),
    ),
    parent: parent === undefined
      ? undefined
      : readParent(validate(parentSchema, parent, `parent of #${number}`)),
    blockedBy: toRelated(
      validate(relatedSchema, blockedBy, `blockers of #${number}`),
    ),
  };
}
