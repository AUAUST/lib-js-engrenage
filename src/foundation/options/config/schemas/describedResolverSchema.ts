import { strictObject, string, type GenericSchema } from "valibot";

import type { DescribedResolver } from "#foundation/options/types/DescribedResolver";

export function describedResolverSchema<Resolver>(
  resolver: GenericSchema<Resolver>,
): GenericSchema<DescribedResolver<Resolver>> {
  return strictObject({ resolve: resolver, description: string() });
}
