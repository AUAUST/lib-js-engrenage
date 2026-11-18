import { loadPrettier } from "#tools/prettier/operations/loadPrettier";
import { resolveSourcePrettierConfig } from "#tools/prettier/operations/resolveSourcePrettierConfig";
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

  const [resources, configFile] = await Promise.all([
    config.resolve("resources"),
    resolveSourcePrettierConfig(config),
  ]);

  const options = await prettier.resolveConfig(path, { config: configFile });

  const { ignored, inferredParser } = await prettier.getFileInfo(path, {
    ignorePath: resources.get("prettierignore") === undefined
      ? undefined
      : resources.path("prettierignore"),
    resolveConfig: false,
    plugins: options?.plugins,
  });

  if (ignored || (options?.parser === undefined && inferredParser === null)) {
    return;
  }

  return prettier.format(content, {
    ...options,
    filepath: path,
  });
};
