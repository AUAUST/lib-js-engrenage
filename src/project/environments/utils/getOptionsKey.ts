import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";

export function getOptionsKey({ name, structure }: EnvironmentEntry): string {
  return structure === undefined ? name : `${name}.options`;
}
