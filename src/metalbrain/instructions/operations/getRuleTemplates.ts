import {
  ruleFrontmatterKeys,
  rulesDirectory,
} from "#metalbrain/instructions/constants";
import { getRegisteredTemplates } from "#metalbrain/instructions/operations/getRegisteredTemplates";
import { createInstructionFile } from "#metalbrain/instructions/utils/createInstructionFile";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";
import type { InstructionRegistry } from "#metalbrain/instructions/types/InstructionRegistry";

export async function getRuleTemplates(config: {
  renderer: FragmentRenderer;
  instructions: InstructionRegistry;
}) {
  const templates = await getRegisteredTemplates("rule", config);

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
