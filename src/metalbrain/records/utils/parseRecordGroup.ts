import {
  array,
  check,
  exactOptional,
  fallback,
  looseObject,
  minLength,
  nonEmpty,
  optional,
  parse,
  pipe,
  regex,
  safeParse,
  strictObject,
  string,
  union,
  unknown,
  type BaseIssue,
  type GenericSchema,
} from "valibot";
import { parse as parseYaml } from "yaml";

import { isRecordId } from "#metalbrain/records/utils/isRecordId";
import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

type FieldValue = string | readonly string[];

function strictMessage(issue: BaseIssue<unknown>): string {
  return issue.expected === "never"
    ? `unknown key ${issue.received}`
    : `expected an object, received ${issue.received}`;
}

const textSchema = pipe(string(), nonEmpty("expected text"));

const detailSchema = union(
  [textSchema, pipe(array(textSchema), minLength(1, "expected items"))],
  "expected text or a list of texts",
);

const sitesSchema = pipe(
  array(pipe(string(), regex(/^[^\s:]+:[1-9]\d*$/u, "expected <path>:<line>"))),
  minLength(1, "expected sites"),
);

const fieldSchemas = {
  text: textSchema,
  sites: exactOptional(sitesSchema),
  detail: exactOptional(detailSchema),
} satisfies Record<RecordFieldType, GenericSchema<unknown, FieldValue | undefined>>;

const looseDetailSchema = fallback(
  optional(union([string(), array(unknown())])),
  undefined,
);

const groupSchema = strictObject(
  {
    purpose: textSchema,
    entries: array(unknown()),
  },
  strictMessage,
);

const collectionSchema = strictObject(
  {
    entries: array(unknown()),
  },
  strictMessage,
);

const looseGroupSchema = fallback(
  looseObject({
    purpose: fallback(optional(textSchema), undefined),
    entries: fallback(array(unknown()), []),
  }),
  { entries: [] },
);

function createEntrySchemas({ fields }: RecordKind) {
  const declared = Object.entries(fields);

  const entry: GenericSchema<
    unknown,
    { readonly id: string } & Readonly<Record<string, FieldValue | undefined>>
  > = strictObject(
    {
      id: pipe(
        string(),
        check(isRecordId, "expected an ID as YYMMDD-xxxx, 4 hex characters"),
      ),
      ...Object.fromEntries(
        declared.map(([key, { type }]) => [key, fieldSchemas[type]]),
      ),
    },
    strictMessage,
  );

  const details = declared.filter(([, { type }]) => type === "detail");

  const loose: GenericSchema<
    unknown,
    {
      readonly id?: string | undefined;
      readonly [key: string]: unknown;
    }
  > = fallback(
    looseObject({
      id: fallback(optional(string()), undefined),
      ...Object.fromEntries(details.map(([key]) => [key, looseDetailSchema])),
    }),
    {},
  );

  return { entry, loose };
}

/**
 * A `kind` group file's `content` read through the kind's schema, a `purpose`
 * required only of a kind keeping a directory: its parse error, or its schema
 * issues and each entry checked on its own, keeping the purpose and each entry's
 * keys read loosely, its ID and details checked for form only, so a departure
 * from the schema hides none of them.
 */
export function parseRecordGroup(kind: RecordKind, content: string) {
  let data: unknown;

  try {
    data = parseYaml(content);
  } catch (error) {
    return {
      kind: "invalid" as const,
      error,
    };
  }

  const schemas = createEntrySchemas(kind);

  const { purpose, entries } = parse(looseGroupSchema, data);

  const strict = safeParse(
    "directory" in kind.location ? groupSchema : collectionSchema,
    data,
  );

  return {
    kind: "parsed" as const,
    purpose,
    issues: strict.success ? [] : strict.issues,
    entries: entries.map((raw) => {
      const loose = parse(schemas.loose, raw);

      const parsed = safeParse(schemas.entry, raw);

      return parsed.success
        ? {
            loose,
            valid: true as const,
            entry: parsed.output,
          }
        : {
            loose,
            valid: false as const,
            issues: parsed.issues,
          };
    }),
  };
}
