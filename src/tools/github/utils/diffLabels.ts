import { entries, keys } from "@auaust/toolkit/object";

import type { Label } from "#tools/github/types/Label";
import type { LabelDiff } from "#tools/github/types/LabelDiff";

type NamedLabel = Label & { readonly name: string };

export function diffLabels(
  desired: Readonly<Record<string, Label>>,
  existing: readonly {
    readonly name: string;
    readonly description: string | null;
    readonly color: string;
  }[],
): LabelDiff {
  const byName = new Map(
    existing.map((label) => {
      return [label.name.toLowerCase(), label] as const;
    }),
  );

  const create: NamedLabel[] = [];

  const update: (NamedLabel & { readonly current: string })[] = [];

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
