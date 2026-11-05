import { text } from "node:stream/consumers";

import type { GenericSchema, InferOutput } from "valibot";

import { validate } from "#foundation/options/index";

export async function readHookPayload<Schema extends GenericSchema>(
  schema: Schema,
  name: string,
): Promise<InferOutput<Schema>> {
  return validate(
    schema,
    JSON.parse(await text(process.stdin)),
    `${name} hook payload`,
  );
}
