import { every } from "@auaust/primitive-kit/arrays";

import { integrations } from "#vscode/constants";
import type { PackageName } from "#types/PackageName";
import type { Integration } from "#vscode/types/Integration";

export function findIntegrations(
  hasDependency: (name: PackageName) => boolean,
): readonly Integration[] {
  return integrations.filter(({ requires }) => every(requires, hasDependency));
}
