import { sort } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { keys } from "@auaust/toolkit/object";

import type { IssueProtocol } from "#tools/github/issues/contract/index";

type Manifest = Readonly<Record<string, unknown>>;

function withoutDrafting(
  manifest: Manifest,
  key: string,
  protocol: IssueProtocol,
): unknown {
  const value = manifest[key];

  return key === protocol.fields.blockers && isArray(value)
    ? sort(value.filter((option) => option !== protocol.options.drafting))
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
  protocol: IssueProtocol,
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
        return JSON.stringify(withoutDrafting(manifest, key, protocol) ?? null);
      },
    );

    if (drafted === fetched) {
      merged[key] = withoutDrafting(remote, key, protocol);
    } else if (published !== fetched && published !== drafted) {
      conflicts.push(key);
    }
  }

  return { manifest: merged, conflicts };
}
