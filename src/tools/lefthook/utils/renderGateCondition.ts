import { map } from "@auaust/primitive-kit/arrays";

export function renderGateCondition(variables: readonly string[]) {
  return {
    run: map(variables, (variable) => `test -n "$${variable}"`).join(" || "),
  };
}
