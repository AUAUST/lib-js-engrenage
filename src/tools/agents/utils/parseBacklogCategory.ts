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
} from "valibot";
import { parse as parseYaml } from "yaml";

import { isBacklogId } from "#tools/agents/utils/isBacklogId";

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

const categorySchema = strictObject(
  {
    purpose: textSchema,
    entries: array(unknown()),
  },
  strictMessage,
);

const entrySchema = strictObject(
  {
    id: pipe(
      string(),
      check(isBacklogId, "expected an ID as YYMMDD-xxxx, 4 hex characters"),
    ),
    title: textSchema,
    sites: exactOptional(
      pipe(
        array(
          pipe(
            string(),
            regex(/^[^\s:]+:[1-9]\d*$/u, "expected <path>:<line>"),
          ),
        ),
        minLength(1, "expected sites"),
      ),
    ),
    why: exactOptional(detailSchema),
    want: exactOptional(detailSchema),
    done: exactOptional(detailSchema),
  },
  strictMessage,
);

// @debt the loose schemas restate the keys of the strict ones by hand, so a key added to one alone goes unread or unchecked
const looseDetailSchema = fallback(
  optional(union([string(), array(unknown())])),
  undefined,
);

const looseEntrySchema = fallback(
  looseObject({
    id: fallback(optional(string()), undefined),
    why: looseDetailSchema,
    want: looseDetailSchema,
    done: looseDetailSchema,
  }),
  {},
);

const looseCategorySchema = fallback(
  looseObject({
    purpose: fallback(optional(textSchema), undefined),
    entries: fallback(array(unknown()), []),
  }),
  { entries: [] },
);

function readEntry(raw: unknown) {
  const loose = parse(looseEntrySchema, raw);

  const strict = safeParse(entrySchema, raw);

  return strict.success
    ? {
        loose,
        valid: true as const,
        entry: strict.output,
      }
    : {
        loose,
        valid: false as const,
        issues: strict.issues,
      };
}

/**
 * A backlog category file's `content` read through the backlog file schema:
 * its parse error, or its schema issues and each entry checked on its own,
 * keeping the purpose, ID and details read loosely so a departure from the
 * schema hides none of them.
 */
export function parseBacklogCategory(content: string) {
  let data: unknown;

  try {
    data = parseYaml(content);
  } catch (error) {
    return {
      kind: "invalid" as const,
      error,
    };
  }

  const { purpose, entries } = parse(looseCategorySchema, data);

  const strict = safeParse(categorySchema, data);

  return {
    kind: "parsed" as const,
    purpose,
    issues: strict.success ? [] : strict.issues,
    entries: entries.map(readEntry),
  };
}
