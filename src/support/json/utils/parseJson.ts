import type { File } from "#types/File";

export function parseJson(content: string, path: File): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}`, {
      cause: error,
    });
  }
}
