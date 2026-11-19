import type { SkillRendering } from "#tools/agents/types/SkillRendering";
import type { BlockFillers } from "#types/BlockFillers";

/**
 * Fills a `<!-- @skill-file <file> -->` block with the repository-relative path
 * of one of the skill's supporting files in the given skills directory.
 */
export function createSkillFileFiller({
  directory,
  skill,
  files,
}: SkillRendering): BlockFillers[string] {
  return (...args) => {
    const [file, ...others] = args;

    if (file === undefined || others.length > 0 || !files.includes(file)) {
      throw new Error(
        `Expected one supporting file of skill "${skill}": ${files.join(", ")}`,
      );
    }

    return `\`${directory}/${skill}/${file}\``;
  };
}
