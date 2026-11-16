import { iterable } from "@auaust/toolkit";

export function renderGateCondition(variables: readonly string[]) {
  return {
    run: iterable.join(
      iterable.map(variables, (variable) => `test -n "$${variable}"`),
      " || ",
    ),
  };
}
