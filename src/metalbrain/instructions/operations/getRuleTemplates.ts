import {
  ruleFrontmatterKeys,
  rulesDirectory,
} from "#metalbrain/instructions/constants";
import { getInstructionTemplates } from "#metalbrain/instructions/operations/getInstructionTemplates";
import { createInstructionFile } from "#metalbrain/instructions/utils/createInstructionFile";
import type { FragmentSources } from "#metalbrain/facts/index";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";

export async function getRuleTemplates(config: {
  renderer: FragmentRenderer;
  fragments: FragmentSources;
}) {
  const templates = await getInstructionTemplates("rules", config);

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
