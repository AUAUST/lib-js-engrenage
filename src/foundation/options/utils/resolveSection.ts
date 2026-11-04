import { validate } from "#foundation/options/utils/validate";
import type { Declaration } from "#foundation/options/types/Declaration";

export function resolveSection<Input, Output, Context>(
  declaration: Declaration<Input, Output, Context>,
  input: unknown,
  context: Context,
  name: string,
): Output {
  return declaration.resolve(
    validate(declaration.schema, input, `${name} config`),
    context,
    name,
  );
}
