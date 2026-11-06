const briefPattern = /^Issue:\s*([\w.-]+\/[\w.-]+)#(\d+)\s*$/m;

export function findBriefedIssue(prompt: string) {
  const match = briefPattern.exec(prompt);

  return match === null
    ? undefined
    : { repository: match[1], number: Number(match[2]) };
}
