import type { Formatter } from "#project/format/ports/Formatter";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

// @debt callers must pass the formatter because `project` cannot import `tools`; the plan's `formatContent(content, { path, root })` needs the adapter bound somewhere
export async function formatContent(
  content: string,
  {
    path,
    root,
    formatter,
  }: { path: File; root: Directory; formatter: Formatter },
): Promise<string> {
  return (await formatter(content, { path, root })) ?? content;
}
