import type { Default } from "#options/types/Default";

export function resolveDefault<Value, Context>(
  fallback: Default<Value, Context>,
  context: Context,
): Value {
  return "compute" in fallback ? fallback.compute(context) : fallback.value;
}
