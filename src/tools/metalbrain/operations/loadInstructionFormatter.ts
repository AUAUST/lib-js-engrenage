import { formatContent, loadFormatter } from "#project/format/index";
import type { InstructionFormatter } from "#metalbrain/instructions/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The project's formatter as metalbrain formats generated instructions with it:
 * leaving content unchanged when the project has none.
 */
export async function loadInstructionFormatter(
  config: LoadedConfig,
): Promise<InstructionFormatter> {
  const formatter = await loadFormatter(config);

  async function format(content: string, path: File): Promise<string> {
    return formatter === undefined
      ? content
      : await formatContent(content, {
          path,
          config,
          formatter,
        });
  }

  return format;
}
