import { join } from "node:path";

import { loadPrettier } from "#tools/prettier/operations/loadPrettier";
import type { Formatter } from "#project/format/ports/Formatter";

export const formatWithPrettier: Formatter = async (
  content,
  { path, root },
) => {
  const prettier = loadPrettier(root);

  if (prettier === undefined) {
    return;
  }

  const { ignored, inferredParser } = await prettier.getFileInfo(path, {
    ignorePath: join(root, ".prettierignore"),
    resolveConfig: true,
  });

  if (ignored || inferredParser === null) {
    return;
  }

  const options = await prettier.resolveConfig(path);

  return prettier.format(content, {
    ...options,
    filepath: path,
  });
};
