import type { LoadedConfig } from "#project/config/index";
import type { Formatter } from "#project/format/ports/Formatter";
import type { File } from "#types/File";

// @debt callers pass the formatter although `format.formatter` selects one from the config
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
