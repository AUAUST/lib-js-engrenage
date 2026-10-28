import { compose, type PropertyComposer } from "@auaust/toolkit/composer";
import { entries } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import type { Accessors } from "#config/types/Accessors";

export function createAccessors<Fields extends object>({
  resolvers,
  describeMissing,
}: {
  resolvers: { [Field in keyof Fields]: () => Fields[Field] };
  describeMissing(field: string): string;
}): Accessors<Fields> {
  const optionalGetters: PropertyComposer[] = [];
  const strictGetters: PropertyComposer[] = [];

  for (const [field, resolver] of entries<Record<string, () => unknown>>(
    resolvers,
  )) {
    const resolve = once(resolver);

    optionalGetters.push(compose.getter(field, resolve));

    strictGetters.push(
      compose.getter(field, function () {
        const value = resolve();

        if (value == null) {
          throw new Error(describeMissing(field));
        }

        return value;
      }),
    );
  }

  const optional = compose(optionalGetters);

  return compose({ optional }, strictGetters) as unknown as Accessors<Fields>;
}
