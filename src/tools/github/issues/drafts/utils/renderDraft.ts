import { isMap, isScalar, type Document } from "yaml";

export function renderDraft(
  manifest: Document,
  body: string,
  options: ReadonlyMap<string, readonly string[]> = new Map(),
): string {
  const { contents } = manifest;

  if (isMap(contents)) {
    for (const { key } of contents.items) {
      const listed = isScalar(key) ? options.get(String(key.value)) : undefined;

      if (isScalar(key) && listed !== undefined) {
        key.commentBefore = ` Options: ${listed.join(", ") || "none"}`;
      }
    }
  }

  const content = body.trim();

  return `---\n${manifest.toString()}---\n${content === "" ? "" : `\n${content}\n`}`;
}
