import type { LoadedConfig } from "#project/config/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { File } from "#types/File";

// @debt callers pass the formatter although `format.formatter` selects one from the config
/**
 * `content` formatted by `formatter` for the file at `path`, or unchanged when
 * the formatter does not format that file.
 */
export async function formatContent(
  content: string,
  {
    path,
    config,
    formatter,
  }: { path: File; config: LoadedConfig; formatter: Formatter },
): Promise<string> {
  return (await formatter(content, { path, config })) ?? content;
}
