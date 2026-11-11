import {
  array,
  check,
  isoDate,
  literal,
  nullable,
  number,
  optional,
  picklist,
  pipe,
  strictObject,
  string,
  variant,
  type GenericSchema,
} from "valibot";

import { record } from "@auaust/toolkit/object";

import {
  claimStates,
  draftStates,
} from "#tools/github/issues/drafts/constants";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import type { GithubSnapshot } from "#tools/github/issues/api/index";
import type { IssueContract } from "#tools/github/issues/contract/index";
import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

type ManifestField = ManifestTarget["types"][number]["fields"][number];

function filled(message: string) {
  return pipe(
    string(),
    check((text) => text.trim() !== "", message),
  );
}

const referenceSchema = pipe(
  string(),
  check((text) => {
    return parseReference(text) !== undefined;
  }, "write a reference as `#123`, `#{new-<slug>}`, `#{<repo>.123}` or `#{<repo>.new-<slug>}`"),
);

const roadmapEntrySchema = strictObject({
  ref: referenceSchema,
  gist: filled("write the gist of the Roadmap entry"),
  sections: array(string()),
});

function choice(options: readonly string[], subject: string) {
  return picklist(options, (issue) => {
    return `${issue.received} is not ${subject}: use ${options.join(", ") || "none"}`;
  });
}

function createFieldSchema({
  name,
  dataType,
  options,
}: ManifestField): GenericSchema {
  const names = options.map((option) => option.name);

  switch (dataType) {
    case "single_select": {
      return optional(nullable(choice(names, `an option of ${name}`)));
    }

    case "multi_select": {
      return optional(array(choice(names, `an option of ${name}`)));
    }

    case "text": {
      return optional(nullable(string()));
    }

    case "number": {
      return optional(nullable(number()));
    }

    case "date": {
      return optional(nullable(pipe(string(), isoDate())));
    }

    default: {
      throw new Error(
        `Field ${name} has the data type ${dataType}, which drafts do not support`,
      );
    }
  }
}

export function createManifestSchema(
  snapshot: GithubSnapshot,
  repository: string,
  contract: IssueContract | undefined,
): GenericSchema<unknown, DraftManifest> {
  const target = resolveManifestTarget(snapshot, repository);

  const common = {
    title: filled("write the issue title"),
    labels: optional(array(choice(target.labels, `a label of ${repository}`))),
    subIssues: optional(
      array(
        contract?.subIssues === "roadmap"
          ? roadmapEntrySchema
          : referenceSchema,
      ),
    ),
    blockedBy: optional(array(referenceSchema)),
    state: optional(picklist(draftStates)),
    claim: optional(picklist(claimStates)),
  };

  const typeNames = target.types.map(({ name }) => name);

  return variant(
    "type",
    target.types.map(({ name, fields }) => {
      return strictObject(
        {
          ...common,
          type: literal(name),
          ...record(
            fields.map((field) => {
              return [field.name, createFieldSchema(field)] as const;
            }),
          ),
        },
        (issue) => {
          return `${issue.received} is not a key of a ${name} manifest; its fields are ${
            fields
              .map((field) => {
                return field.name;
              })
              .join(", ") || "none"
          }`;
        },
      );
    }),
    (issue) => {
      return `${issue.received} is not an issue type: use ${typeNames.join(", ")}`;
    },
  );
}
