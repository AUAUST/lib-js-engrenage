import { text } from "node:stream/consumers";

import type { GenericSchema, InferOutput } from "valibot";

import { validateHookPayload } from "#tools/agents/operations/validateHookPayload";

export async function readHookPayload<Schema extends GenericSchema>(
  schema: Schema,
  name: string,
): Promise<InferOutput<Schema>> {
  return validateHookPayload(
    schema,
    JSON.parse(await text(process.stdin)),
    name,
  );
}
