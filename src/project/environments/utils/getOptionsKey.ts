import type { ContributedEnvironmentEntry } from "#project/environments/types/ContributedEnvironmentEntry";

export function getOptionsKey({
  entry,
  kind,
}: ContributedEnvironmentEntry): string {
  return kind.structure === undefined ? entry.name : `${entry.name}.options`;
}
