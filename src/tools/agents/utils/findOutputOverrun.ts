import { formatCount } from "#tools/agents/utils/formatCount";

export function findOutputOverrun(
  output: string,
  limit: number,
): string | undefined {
  return output.length > limit
    ? `This command printed ${formatCount(output.length)} characters, past the ${formatCount(limit)} output limit: every later call reads them again. Bound the next outputs to what you need with \`head\`, \`sed -n\`, \`grep\`, \`jq\` fields or a log file.`
    : undefined;
}
