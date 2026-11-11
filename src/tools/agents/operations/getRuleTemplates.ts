import { ruleFrontmatterKeys, rulesDirectory } from "#tools/agents/constants";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { createInstructionFile } from "#tools/agents/utils/createInstructionFile";
import type { Extension } from "#project/config/index";

export async function getRuleTemplates(extensions?: readonly Extension[]) {
  const templates = await getInstructionTemplates("rules", extensions);

  return templates.map((template) => {
    const { name, paths, reference, body } = template;

    const frontmatter = {
      keys: ruleFrontmatterKeys,
      values: paths === undefined ? {} : { paths },
    };

    return {
      ...template,
      file: `${rulesDirectory}/${name}.md`,
      frontmatter,
      content: createInstructionFile({
        frontmatter: paths === undefined ? undefined : frontmatter.values,
        reference,
        body,
      }),
    };
  });
}
