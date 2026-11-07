import type { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";

export type SkillDefinition = Awaited<
  ReturnType<typeof getSkillDefinitions>
>[number];
