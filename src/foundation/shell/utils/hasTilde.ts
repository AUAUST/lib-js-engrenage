import type { WordPart } from "sh-syntax";

export function hasTilde(parts: readonly WordPart[]) {
  const [first] = parts;

  return first?.type === "Lit" && first.value.startsWith("~");
}
