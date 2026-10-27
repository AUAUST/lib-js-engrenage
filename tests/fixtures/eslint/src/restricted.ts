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

export function formatFiles(files: string[]) {
  return files.map((file) => `~   ${file}\n`);
}

export function partiallyReassigned(cases: Array<[number, string]>) {
  const labels: string[] = [];

  for (let [count, label] of cases) {
    count += 1;

    labels.push(`${label}${count}`);
  }

  return labels;
}
