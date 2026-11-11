import {
  array,
  nullish,
  number,
  object,
  optional,
  picklist,
  string,
} from "valibot";

import { validate } from "#foundation/options/index";
import {
  isMissingResource,
  splitRepository,
  type GithubClient,
} from "#tools/github/issues/api/index";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";

const stateSchema = picklist(["open", "closed"]);

const relatedSchema = array(object({ number: number(), state: stateSchema }));

const issueSchema = object({
  number: number(),
  title: string(),
  body: nullish(string()),
  state: stateSchema,
  type: nullish(object({ name: string() })),
});

const fieldValuesSchema = array(
  object({
    issue_field_name: string(),
    multi_select_options: optional(array(object({ name: string() }))),
  }),
);

const parentSchema = object({ number: number() });

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
): Promise<GithubIssue> {
  const route = { ...splitRepository(repository), issue_number: number };

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

  const blockers = validate(fieldValuesSchema, fields, `fields of #${number}`)
    .filter(({ issue_field_name }) => {
      return issue_field_name === protocol.fields.blockers;
    })
    .flatMap(({ multi_select_options = [] }) => {
      return multi_select_options.map(({ name }) => name);
    });

  return {
    number: checked.number,
    title: checked.title,
    body: checked.body ?? "",
    state: checked.state,
    type: checked.type?.name,
    blockers,
    subIssues: validate(relatedSchema, subIssues, `sub-issues of #${number}`),
    parent: parent === undefined
      ? undefined
      : validate(parentSchema, parent, `parent of #${number}`).number,
    blockedBy: validate(relatedSchema, blockedBy, `blockers of #${number}`),
  };
}
