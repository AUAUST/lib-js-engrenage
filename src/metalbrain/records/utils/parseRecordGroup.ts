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

import { formatRecordTime } from "#metalbrain/records/utils/formatRecordTime";
import { parseRecordId } from "#metalbrain/records/utils/parseRecordId";
import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

type FieldValue = string | readonly string[];

function strictMessage(issue: BaseIssue<unknown>): string {
  return issue.expected === "never"
    ? `unknown key ${issue.received}`
    : `expected an object, received ${issue.received}`;
}

const textSchema = pipe(string(), nonEmpty("expected text"));

const lineSchema = pipe(textSchema, regex(/^[^\n]*$/u, "expected one line"));

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
  line: exactOptional(lineSchema),
  sites: exactOptional(sitesSchema),
  detail: exactOptional(detailSchema),
} satisfies Record<RecordFieldType, GenericSchema<unknown, FieldValue | undefined>>;

const looseDetailSchema = fallback(
  optional(union([string(), array(unknown())])),
  undefined,
);

const timeSchema = pipe(
  string(),
  regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u,
    "expected a UTC time as YYYY-MM-DDTHH:MM:SSZ",
  ),
  check((time) => {
    return formatRecordTime(new Date(time)) === time;
  }, "expected an existing time"),
);

const looseGroupSchema = fallback(
  looseObject({
    purpose: fallback(optional(textSchema), undefined),
    taps: fallback(array(unknown()), []),
    entries: fallback(array(unknown()), []),
  }),
  { taps: [], entries: [] },
);

function createIdSchema(namespace: string) {
  return pipe(
    string(),
    check(
      (id) => parseRecordId(id)?.namespace === namespace,
      `expected an ID as ${namespace}-xxxxxx, 6 hex characters`,
    ),
  );
}

function createGroupSchema({ location, namespace, taps }: RecordKind) {
  const tap = strictObject(
    {
      id: createIdSchema(namespace),
      at: timeSchema,
      note: exactOptional(lineSchema),
    },
    strictMessage,
  );

  const keys: Record<string, GenericSchema> = {
    ...("directory" in location && { purpose: textSchema }),
    ...(taps === true && {
      taps: exactOptional(pipe(array(tap), minLength(1, "expected taps"))),
    }),
    entries: array(unknown()),
  };

  return {
    group: strictObject(keys, strictMessage),
    tap,
  };
}

function createEntrySchemas({ namespace, fields }: RecordKind) {
  const declared = Object.entries(fields);

  const entry: GenericSchema<
    unknown,
    { readonly id: string; readonly created: string } & Readonly<
      Record<string, FieldValue | undefined>
    >
  > = strictObject(
    {
      id: createIdSchema(namespace),
      created: timeSchema,
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
      readonly created?: string | undefined;
      readonly [key: string]: unknown;
    }
  > = fallback(
    looseObject({
      id: fallback(optional(string()), undefined),
      created: fallback(optional(string()), undefined),
      ...Object.fromEntries(details.map(([key]) => [key, looseDetailSchema])),
    }),
    {},
  );

  return { entry, loose };
}

/**
 * A `kind` group file's `content` read through the kind's schema, a `purpose`
 * required only of a kind keeping a directory, `taps` allowed only of a kind
 * taking taps: its parse error, or its schema issues, its taps of valid form and
 * each entry checked on its own, keeping the purpose and each entry's keys read
 * loosely, its ID and details checked for form only, so a departure from the
 * schema hides none of them.
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

  const groupSchemas = createGroupSchema(kind);

  const { purpose, taps, entries } = parse(looseGroupSchema, data);

  const strict = safeParse(groupSchemas.group, data);

  return {
    kind: "parsed" as const,
    purpose,
    issues: strict.success ? [] : strict.issues,
    taps: taps.flatMap((raw) => {
      const tap = safeParse(groupSchemas.tap, raw);

      return tap.success ? [tap.output] : [];
    }),
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
