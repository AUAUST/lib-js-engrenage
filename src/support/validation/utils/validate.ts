import type { File } from "#types/File";
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

export function validate<Schema extends GenericSchema>(
  schema: Schema,
  input: unknown,
  source: File,
): InferOutput<Schema> {
  const result = safeParse(schema, input);

  if (!result.success) {
    const [issue, ...issues] = result.issues;

    const [first = issue, ...others] = [issue, ...issues].flatMap(
      expandUnionIssue,
    );

    throw new Error(`Invalid ${source}:\n${summarize([first, ...others])}`);
  }

  return result.output;
}
