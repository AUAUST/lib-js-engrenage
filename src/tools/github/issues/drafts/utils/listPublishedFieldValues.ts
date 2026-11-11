import { isArray } from "@auaust/toolkit/isArray";
import { isNumber } from "@auaust/toolkit/isNumber";
import { isString } from "@auaust/toolkit/isString";

import type { FieldValue } from "#tools/github/issues/drafts/types/FieldValue";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

function readFieldValue(value: unknown): FieldValue {
  if (isString(value) || isNumber(value)) {
    return value;
  }

  return isArray(value) ? value.filter(isString) : undefined;
}

export function listPublishedFieldValues(
  { context, target }: Publication,
  { manifest }: PublishedDraft,
  drafting: boolean,
) {
  const fields = (
    target.types.find(({ name }) => {
      return name === manifest.type;
    })?.fields ?? []
  );

  const option = context.protocol.options.drafting;

  return fields.map((field) => {
    const value = readFieldValue(manifest[field.name]);

    if (field.name !== context.protocol.fields.blockers) {
      return { field, value };
    }

    const kept = (isArray(value) ? value : []).filter((name) => {
      return name !== option;
    });

    return { field, value: drafting ? [...kept, option] : kept };
  });
}
