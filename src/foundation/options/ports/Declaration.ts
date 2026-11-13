import type { GenericSchema } from "valibot";

export interface Declaration<Input, Output, Context> {
  readonly schema: GenericSchema<Input>;
  resolve(input: unknown, context: Context, path: string): Output;
}
