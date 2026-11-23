import type { getSkillDefinitions } from "#metalbrain/runtimes/operations/getSkillDefinitions";

export type SkillDefinition = Awaited<
  ReturnType<typeof getSkillDefinitions>
>[number];
