import type { GenericSchema, InferOutput } from "valibot";

import { validate } from "#foundation/options/index";

export function validateHookPayload<Schema extends GenericSchema>(
  schema: Schema,
  payload: unknown,
  name: string,
): InferOutput<Schema> {
  return validate(schema, payload, `${name} hook payload`);
}
