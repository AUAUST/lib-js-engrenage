import { loadPrettier } from "#tools/prettier/operations/loadPrettier";
import type { Formatter } from "#project/format/ports/Formatter";

/**
 * Formats `content` as the file at `path` with the project's Prettier config.
 * Resolves to `undefined` when Prettier is not installed in the project, the
 * file is ignored or Prettier infers no parser for it.
 */
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
    ignorePath: resources.get("prettierignore") === undefined
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
