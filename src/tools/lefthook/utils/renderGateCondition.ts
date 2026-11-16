import { join, map as mapIterable } from "@auaust/toolkit/iterable";

export function renderGateCondition(variables: readonly string[]) {
  return {
    run: join(
      mapIterable(variables, (variable) => `test -n "$${variable}"`),
      " || ",
    ),
  };
}
