import { every } from "@auaust/primitive-kit/arrays";

import { integrations } from "#tools/vscode/constants";
import type { Integration } from "#tools/vscode/types/Integration";
import type { PackageName } from "#types/PackageName";

export function findIntegrations(
  hasDependency: (name: PackageName) => boolean,
): readonly Integration[] {
  return integrations.filter(({ requires }) => every(requires, hasDependency));
}
