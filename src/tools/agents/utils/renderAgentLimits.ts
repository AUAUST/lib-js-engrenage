import { formatCount } from "#tools/agents/utils/formatCount";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";

export function renderAgentLimits(
  definitions: readonly Pick<SkillDefinition, "agent">[],
): string {
  const agents = definitions.flatMap(({ agent }) => {
    return agent === undefined ? [] : [agent];
  });

  if (agents.length === 0) {
    return "No agent skills are installed.";
  }

  const lines = [
    "| Agent | Default effort | Effort by complexity | Fresh up to |",
    "| --- | --- | --- | --- |",
  ];

  for (const { name, effort, efforts, ceiling } of agents) {
    const byComplexity = Object.entries(efforts ?? {})
      .map(([complexity, value]) => {
        return `\`${complexity}\`: ${value}`;
      })
      .join(", ");

    lines.push(
      `| \`${name}\` | ${effort ?? "inherited"} | ${byComplexity || "none"} | ${
        ceiling === undefined ? "no limit" : `${formatCount(ceiling)} context`
      } |`,
    );
  }

  return lines.join("\n");
}
