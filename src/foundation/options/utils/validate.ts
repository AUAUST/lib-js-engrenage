import {
  getDotPath,
  safeParse,
  summarize,
  type BaseIssue,
  type GenericSchema,
  type InferOutput,
  type IssuePathItem,
} from "valibot";

function expandUnionIssue(issue: BaseIssue<unknown>): BaseIssue<unknown>[] {
  const branchIssues: BaseIssue<unknown>[] = [];

  for (const nested of issue.issues ?? []) {
    if (nested.path === undefined) {
      if (nested.issues !== undefined) {
        branchIssues.push(...expandUnionIssue({ ...nested, path: issue.path }));
      }

      continue;
    }

    const path: [IssuePathItem, ...IssuePathItem[]] = issue.path === undefined
      ? nested.path
      : [...issue.path, ...nested.path];

    branchIssues.push(
      ...expandUnionIssue({
        ...nested,
        path,
      }),
    );
  }

  return branchIssues.length === 0 ? [issue] : branchIssues;
}

function describeIssue(issue: BaseIssue<unknown>): BaseIssue<unknown> {
  // @debt detects valibot's default key message by its wording to keep the messages a schema sets, such as the renamed keys of `declareObject`
  if (
    issue.type === "strict_object" &&
    issue.expected === "never" &&
    issue.message.startsWith("Invalid key:")
  ) {
    return {
      ...issue,
      message: `Unknown key ${issue.received}`,
    };
  }

  return issue;
}

/**
 * The input `schema` validates, its issues named after `subject`; `locate` names
 * the source of the value at an issue's dotted path, `""` for the input itself,
 * appended to its message when it returns one.
 *
 * @throws Listing every issue, when `schema` rejects `input`.
 */
export function validate<Schema extends GenericSchema>(
  schema: Schema,
  input: unknown,
  subject: string,
  locate?: (path: string) => string | undefined,
): InferOutput<Schema> {
  const result = safeParse(schema, input);

  if (!result.success) {
    const [issue, ...issues] = result.issues;

    const [first = issue, ...others] = [issue, ...issues]
      .flatMap(expandUnionIssue)
      .map(describeIssue)
      .map((described) => {
        const source = locate?.(getDotPath(described) ?? "");

        return source === undefined
          ? described
          : { ...described, message: `${described.message}, set by ${source}` };
      });

    throw new Error(`Invalid ${subject}:\n${summarize([first, ...others])}`);
  }

  return result.output;
}
