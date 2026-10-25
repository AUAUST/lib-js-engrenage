import type { File } from "#types/File";
import {
  safeParse,
  summarize,
  type GenericSchema,
  type InferOutput,
} from "valibot";

export function validate<Schema extends GenericSchema>(
  schema: Schema,
  input: unknown,
  source: File,
): InferOutput<Schema> {
  const result = safeParse(schema, input);

  if (!result.success) {
    throw new Error(`Invalid ${source}:\n${summarize(result.issues)}`);
  }

  return result.output;
}
