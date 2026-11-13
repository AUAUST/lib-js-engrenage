import type { GenericSchema } from "valibot";

export interface Declaration<Input, Output, Context> {
  /**
   * Validates the option's input without the resolve context; the resolver
   * validates the input against it before the section resolves.
   */
  readonly schema: GenericSchema<Input>;
  /**
   * Turns input `schema` validated into the option's value for `context`, applying
   * defaults; `path` names the option in errors.
   *
   * @throws When the input fails a context-dependent check or a required value
   * is missing.
   */
  resolve(input: unknown, context: Context, path: string): Output;
}
