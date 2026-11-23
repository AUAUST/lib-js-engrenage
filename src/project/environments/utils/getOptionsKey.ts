import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export function getOptionsKey({ entry }: ContributedEnvironmentEntry): string {
  return `${entry.name}.options`;
}
