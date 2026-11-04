import { isPlainObject } from "@auaust/toolkit/isPlainObject";

export function withSourceRuntime(
  input: Record<string, unknown> = {},
): Record<string, unknown> {
  const { src } = input;

  if (src === false) {
    return input;
  }

  const source = isPlainObject(src) ? src : {};

  if (source.baseline !== undefined || source.node !== undefined) {
    return input;
  }

  return {
    ...input,
    src: { ...source, baseline: "2026-10" },
  };
}
