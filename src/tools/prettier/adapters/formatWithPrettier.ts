import { loadPrettier } from "#tools/prettier/operations/loadPrettier";
import type { Formatter } from "#project/format/ports/Formatter";

export const formatWithPrettier: Formatter = async (
  content,
  { path, config },
) => {
  const prettier = loadPrettier(config.context.root);

  if (prettier === undefined) {
    return;
  }

  const resources = await config.resolve("resources");

  const { ignored, inferredParser } = await prettier.getFileInfo(path, {
    ignorePath:
      resources.get("prettierignore") === undefined
        ? undefined
        : resources.path("prettierignore"),
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
