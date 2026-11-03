import {
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

    const path: [IssuePathItem, ...IssuePathItem[]] =
      issue.path === undefined ? nested.path : [...issue.path, ...nested.path];

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
  if (issue.type === "strict_object" && issue.expected === "never") {
    return {
      ...issue,
      message: `Unknown key ${issue.received}`,
    };
  }

  return issue;
}

export function validate<Schema extends GenericSchema>(
  schema: Schema,
  input: unknown,
  subject: string,
): InferOutput<Schema> {
  const result = safeParse(schema, input);

  if (!result.success) {
    const [issue, ...issues] = result.issues;

    const [first = issue, ...others] = [issue, ...issues]
      .flatMap(expandUnionIssue)
      .map(describeIssue);

    throw new Error(`Invalid ${subject}:\n${summarize([first, ...others])}`);
  }

  return result.output;
}
