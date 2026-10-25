import { value } from "@auaust/toolkit/value";
import type { Maybe } from "@auaust/toolkit/types";

import type { ConfigInput } from "#types/ConfigInput";

export async function resolveConfigInput<Data, Arguments extends unknown[]>(
  input: ConfigInput<Data, Arguments>,
  ...args: Arguments
): Promise<Maybe<Data>> {
  return value(input, ...args);
}
