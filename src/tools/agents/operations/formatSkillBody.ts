import { formatContent, type Formatter } from "#project/format/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * A rendered skill `body` as sync writes it into `path`: formatted by `formatter`,
 * or unchanged when the project has none.
 */
export async function formatSkillBody(
  body: string,
  {
    path,
    config,
    formatter,
  }: { path: File; config: LoadedConfig; formatter: Formatter | undefined },
): Promise<string> {
  return formatter === undefined
    ? body
    : await formatContent(body, {
        path,
        config,
        formatter,
      });
}
