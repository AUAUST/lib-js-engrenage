import type { Default } from "#foundation/options/ports/Default";

export function unset(explain: string): Default<undefined, unknown> {
  return {
    explain,
    compute() {},
  };
}
