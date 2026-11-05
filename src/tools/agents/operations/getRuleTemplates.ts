import { ruleFrontmatterKeys } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { createInstructionFile } from "#tools/agents/utils/createInstructionFile";

export async function getRuleTemplates() {
  const templates = await getInstructionTemplates("rules");

  return templates.map((template) => {
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
