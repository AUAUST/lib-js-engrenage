import { format, resolveConfig } from "prettier";

import type { File } from "#types/File";

export async function formatModule(
  path: File,
  content: string,
): Promise<string> {
  const options = await resolveConfig(path);

  return format(content, {
    ...options,
    filepath: path,
  });
}
