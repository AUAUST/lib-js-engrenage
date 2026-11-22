import { issueContracts } from "#tools/github/issues/contract/constants";

const planSections = new Set<string>(issueContracts.plan.sections);

export function isModelSection(name: string) {
  return !planSections.has(name);
}
