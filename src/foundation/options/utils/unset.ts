import type { Default } from "#options/types/Default";

export function unset(explain: string): Default<undefined, unknown> {
  return {
    explain,
    compute() {},
  };
}
