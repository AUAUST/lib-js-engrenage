import { isArray } from "@auaust/toolkit";
import { sort } from "@auaust/toolkit/array";
import { hasOwn, keys } from "@auaust/toolkit/object";

import type { ContractNames } from "#tools/github/issues/contract/index";

type Manifest = Readonly<Record<string, unknown>>;

function withoutDrafting(
  manifest: Manifest,
  key: string,
  contractNames: ContractNames,
): unknown {
  const value = manifest[key];

  return key === contractNames.fields.blockers && isArray(value)
    ? sort(value.filter((option) => option !== contractNames.options.drafting))
    : value;
}

export function mergeDraftManifest(
  {
    base,
    remote,
    local,
  }: {
    readonly base: Manifest;
    readonly remote: Manifest;
    readonly local: Manifest;
  },
  contractNames: ContractNames,
): {
  readonly manifest: Manifest;
  readonly conflicts: readonly string[];
} {
  const merged: Record<string, unknown> = { ...local };
  const conflicts: string[] = [];

  const names = new Set([...keys(base), ...keys(remote), ...keys(local)]);

  names.delete("claim");

  for (const key of names) {
    const [fetched, published, drafted] = [base, remote, local].map(
      (manifest) => {
        return JSON.stringify(
          withoutDrafting(manifest, key, contractNames) ?? null,
        );
      },
    );

    if (drafted === fetched) {
      if (hasOwn(local, key) || published !== fetched) {
        merged[key] = withoutDrafting(remote, key, contractNames);
      }
    } else if (published !== fetched && published !== drafted) {
      conflicts.push(key);
    }
  }

  return { manifest: merged, conflicts };
}
