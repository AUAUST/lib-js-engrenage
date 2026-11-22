import type { BlockFillers } from "#types/BlockFillers";
import type { Directory } from "#types/Directory";

/**
 * Fills a block naming one of `files`, a skill's supporting or shared files,
 * with the repository-relative path of its copy beside the skill in the given
 * skills directory, and passes the name to `onFill`.
 */
export function createSkillFileFiller(
  { directory, skill }: { directory: Directory; skill: string },
  {
    kind,
    files,
    onFill,
  }: {
    kind: "supporting" | "shared";
    files: readonly string[];
    onFill?: ((file: string) => void) | undefined;
  },
): BlockFillers[string] {
  return (...args) => {
    const [file, ...others] = args;

    if (file === undefined || others.length > 0 || !files.includes(file)) {
      throw new Error(
        `Expected one ${kind} file of skill "${skill}": ${files.length === 0 ? "none" : files.join(", ")}`,
      );
    }

    onFill?.(file);

    return `\`${directory}/${skill}/${file}\``;
  };
}
