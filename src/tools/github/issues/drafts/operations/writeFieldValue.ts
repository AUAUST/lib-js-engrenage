import { sort } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isNumber } from "@auaust/toolkit/isNumber";
import { isString } from "@auaust/toolkit/isString";

import { splitRepository } from "#tools/github/issues/api/index";
import type { IssueAccess } from "#tools/github/issues/contract/index";
import type { FieldValue } from "#tools/github/issues/drafts/types/FieldValue";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

type ManifestField = ManifestTarget["types"][number]["fields"][number];

function isEmpty(value: FieldValue) {
  return value == null || (isArray(value) && value.length === 0);
}

function toKey(value: FieldValue) {
  return isArray(value) ? sort([...value]).join("\n") : String(value);
}

export async function writeFieldValue(
  { repository, client }: IssueAccess,
  number: number,
  field: ManifestField,
  current: FieldValue,
  desired: FieldValue,
): Promise<void> {
  if (isEmpty(current) && isEmpty(desired)) {
    return;
  }

  if (!isEmpty(current) && toKey(current) === toKey(desired)) {
    return;
  }

  const route = { ...splitRepository(repository), issue_number: number };

  const removes = (
    isArray(current) &&
    current.some((value) => {
      return !isArray(desired) || !desired.includes(value);
    })
  );

  if (isEmpty(desired) || removes) {
    await client.request(
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values/{issue_field_id}",
      { ...route, issue_field_id: field.id },
    );
  }

  if (desired == null || isEmpty(desired)) {
    return;
  }

  const value = isString(desired) || isNumber(desired) ? desired : [...desired];

  await client.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values",
    {
      ...route,
      issue_field_values: [
        {
          field_id: field.id,
          value,
        },
      ],
    },
  );
}
