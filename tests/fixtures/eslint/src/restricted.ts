const { isArray } = Array;

export function restricted(value: unknown) {
  if (typeof value === "string") {
    return Array.isArray(value) || isArray(value) || Array["isArray"](value);
  }

  return typeof value === "undefined";
}
