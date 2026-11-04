import { ruleFrontmatterKeys } from "#agents/constants";
import { createInstructionFile } from "#agents/utils/createInstructionFile";
import { getInstructionTemplates } from "#agents/utils/getInstructionTemplates";

export function getRuleTemplates() {
  return getInstructionTemplates("rules").map((template) => {
    const { name, paths, reference, body } = template;

    const frontmatter = {
      keys: ruleFrontmatterKeys,
      values: paths === undefined ? {} : { paths },
    };

    return {
      ...template,
      file: `.claude/rules/${name}.md`,
      frontmatter,
      content: createInstructionFile({
        frontmatter: paths === undefined ? undefined : frontmatter.values,
        reference,
        body,
      }),
    };
  });
}
