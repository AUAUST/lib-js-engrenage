import { getInstructionTemplates } from "#agents/utils/getInstructionTemplates";

export function getRuleTemplates() {
  return getInstructionTemplates("rules").map((template) => {
    return {
      ...template,
      file: `.claude/rules/${template.name}.md`,
    };
  });
}
