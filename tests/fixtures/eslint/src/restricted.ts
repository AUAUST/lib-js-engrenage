const { isArray } = Array;

export function restricted(value: unknown) {
  if (typeof value === "string") {
    return Array.isArray(value) || isArray(value) || Array["isArray"](value);
  }

  return typeof value === "undefined";
}

export function describe(value: unknown) {
  const kinds: Record<string, string> = {
    string: "text",
  };

  const kind = typeof value;

  return kinds[typeof value] ?? kind;
}

export const formatFile = (file: string) => `~   ${file}\n`;

export function partiallyReassigned(cases: Array<[number, string]>) {
  for (let [count, label] of cases) {
    count += 1;

    return `${label}${count}`;
  }
}
