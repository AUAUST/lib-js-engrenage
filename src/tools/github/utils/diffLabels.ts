import { entries, keys } from "@auaust/toolkit/object";

import type { RepositoryLabel } from "#tools/github/issues/api/index";
import type { Label } from "#tools/github/types/Label";
import type { LabelDiff } from "#tools/github/types/LabelDiff";
import type { LabelUpdate } from "#tools/github/types/LabelUpdate";
import type { NamedLabel } from "#tools/github/types/NamedLabel";

export function diffLabels(
  desired: Readonly<Record<string, Label>>,
  existing: readonly Pick<RepositoryLabel, "name" | "description" | "color">[],
): LabelDiff {
  const byName = new Map(
    existing.map((label) => {
      return [label.name.toLowerCase(), label] as const;
    }),
  );

  const create: NamedLabel[] = [];

  const update: LabelUpdate[] = [];

  for (const [name, label] of entries(desired)) {
    const current = byName.get(name.toLowerCase());

    if (current === undefined) {
      create.push({ name, ...label });
    } else if (
      current.name !== name ||
      (current.description ?? "") !== label.description ||
      current.color.toLowerCase() !== label.color.toLowerCase()
    ) {
      update.push({
        name,
        ...label,
        current: current.name,
      });
    }
  }

  const declared = new Set(keys(desired).map((name) => name.toLowerCase()));

  const extra = existing
    .filter(({ name }) => !declared.has(name.toLowerCase()))
    .map(({ name }) => name);

  return {
    create,
    update,
    extra,
  };
}
