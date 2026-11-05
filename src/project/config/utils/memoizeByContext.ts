import type { ConfigContext } from "#project/config/types/ConfigContext";

export function memoizeByContext<Value>(
  create: (context: ConfigContext) => Value,
): (context: ConfigContext) => Value {
  const values = new WeakMap<ConfigContext, Value>();

  return (context) => {
    const known = values.get(context);

    if (known !== undefined) {
      return known;
    }

    const created = create(context);

    values.set(context, created);

    return created;
  };
}
