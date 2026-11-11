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
  requestGithub,
  type GithubAccess,
} from "#tools/github/issues/api/index";
import { blockersField } from "#tools/github/issues/contract/constants";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";

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

export async function fetchIssue(
  { repository, token }: GithubAccess,
  number: number,
): Promise<GithubIssue> {
  const base = `/repos/${repository}/issues/${number}`;

  const [issue, fields, subIssues, parent, blockedBy] = await Promise.all([
    requestGithub(token, base),
    requestGithub(token, `${base}/issue-field-values`),
    requestGithub(token, `${base}/sub_issues`),
    requestGithub(token, `${base}/parent`, { missing: "undefined" }),
    requestGithub(token, `${base}/dependencies/blocked_by`),
  ]);

  const checked = validate(issueSchema, issue, `issue #${number}`);

  const blockers = validate(fieldValuesSchema, fields, `fields of #${number}`)
    .filter(({ issue_field_name }) => issue_field_name === blockersField)
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
