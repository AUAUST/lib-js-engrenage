import {
  array,
  check,
  isoDate,
  literal,
  minLength,
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

import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  findTypeMeaning,
  type ContractNames,
  type IssueType,
} from "#tools/github/issues/contract/index";
import {
  claimStates,
  draftStates,
  quoteReferenceHint,
} from "#tools/github/issues/drafts/constants";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import type { GithubSnapshot } from "#tools/github/issues/api/index";
import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

type ManifestField = ManifestTarget["types"][number]["fields"][number];

type FieldMeaning = keyof ContractNames["fields"];

const requiredFields = {
  task: ["nature", "complexity"],
  problem: ["defect", "complexity"],
  resource: ["material"],
  plan: [],
  segment: [],
  idea: [],
} as const satisfies Record<IssueType, readonly FieldMeaning[]>;

function listRequiredFields(
  contractNames: ContractNames,
  meaning: IssueType | undefined,
): readonly string[] {
  if (meaning === undefined) {
    return [];
  }

  return requiredFields[meaning].map((field: FieldMeaning) => {
    return contractNames.fields[field];
  });
}

function filled(message: string) {
  return pipe(
    string(),
    check((text) => text.trim() !== "", message),
  );
}

const referenceSchema = pipe(
  string(quoteReferenceHint),
  check((text) => {
    return parseReference(text) !== undefined;
  }, "write a reference as `#123`, `#{new-<slug>}`, `#{<repo>.123}` or `#{<repo>.new-<slug>}`"),
);

const roadmapEntrySchema = strictObject({
  ref: referenceSchema,
  gist: filled("write the gist of the Roadmap entry"),
  sections: array(string()),
});

function listOptions(options: readonly string[]) {
  return options.join(", ") || "none";
}

function choice(options: readonly string[], subject: string) {
  return picklist(options, (issue) => {
    return `${issue.received} is not ${subject}: use ${listOptions(options)}`;
  });
}

function createFieldSchema(
  { name, dataType, options }: ManifestField,
  required: boolean,
): GenericSchema {
  const names = options.map((option) => option.name);

  switch (dataType) {
    case "single_select": {
      const option = nullable(choice(names, `an option of ${name}`));

      return required
        ? optional(
            pipe(
              option,
              check(
                (value) => {
                  return value != null;
                },
                `set ${name}: use ${listOptions(names)}`,
              ),
            ),
            null,
          )
        : optional(option);
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
  contractNames: ContractNames,
): GenericSchema<unknown, DraftManifest> {
  const target = resolveManifestTarget(snapshot, repository);

  const label = choice(target.labels, `a label of ${repository}`);

  const common = {
    title: filled("write the issue title"),
    labels: target.labels.length > 0
      ? optional(
          pipe(
            array(label),
            minLength(
              1,
              `set at least one label: use ${listOptions(target.labels)}`,
            ),
          ),
          [],
        )
      : optional(array(label)),
    blockedBy: optional(array(referenceSchema)),
    state: optional(picklist(draftStates)),
    claim: optional(picklist(claimStates)),
    resplit: optional(filled("write why the issues are re-split")),
  };

  const typeNames = target.types.map(({ name }) => name);

  return variant(
    "type",
    target.types.map(({ name, fields }) => {
      const required = listRequiredFields(
        contractNames,
        findTypeMeaning(contractNames, name),
      );

      const meaning = findContractMeaning(contractNames, name);

      return strictObject(
        {
          ...common,
          subIssues: optional(
            array(
              meaning !== undefined &&
                issueContracts[meaning].subIssues === "roadmap"
                ? roadmapEntrySchema
                : referenceSchema,
            ),
          ),
          type: literal(name),
          ...record(
            fields.map((field) => {
              return [
                field.name,
                createFieldSchema(field, required.includes(field.name)),
              ] as const;
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
