import type { ConfigInput } from "#types/ConfigInput";
import { value } from "@auaust/toolkit/value";

export async function resolveConfigInput<Data, Arguments extends unknown[]>(
  input: ConfigInput<Data, Arguments>,
  ...args: Arguments
): Promise<Data> {
  return value(input, ...args);
}
