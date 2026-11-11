import { values } from "@auaust/toolkit/object";

import {
  splitRepository,
  type GithubSnapshot,
} from "#tools/github/issues/api/index";
import { reservedKeys } from "#tools/github/issues/drafts/constants";
import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

function findReservedKey(name: string) {
  return reservedKeys.find((key) => key.toLowerCase() === name.toLowerCase());
}

export function resolveManifestTarget(
  snapshot: GithubSnapshot,
  repository: string,
): ManifestTarget {
  const fetched = values(snapshot.repositories).find((entry) => {
    return entry.repository === repository;
  });

  if (fetched === undefined) {
    throw new Error(
      `${repository} is not in the GitHub snapshot: register it, then run \`engrenage github fetch\``,
    );
  }

  const { owner } = splitRepository(repository);

  const organization = snapshot.organizations[owner];

  if (organization === undefined) {
    throw new Error(
      `The GitHub snapshot has no issue types for ${owner}: drafts need an organization's types and fields`,
    );
  }

  return {
    repository,
    labels: fetched.labels.map(({ name }) => name),
    types: organization.types
      .filter(({ enabled }) => enabled)
      .map(({ name, pinnedFields }) => {
        return {
          name,
          fields: pinnedFields.map((pinned) => {
            const field = organization.fields.find((candidate) => {
              return candidate.name === pinned;
            });

            if (field === undefined) {
              throw new Error(
                `Type ${name} pins ${pinned}, which the GitHub snapshot lacks: run \`engrenage github fetch\``,
              );
            }

            const key = findReservedKey(field.name);

            if (key !== undefined) {
              throw new Error(
                `Field ${field.name} is named like the reserved manifest key \`${key}\`: rename it on GitHub`,
              );
            }

            return field;
          }),
        };
      }),
  };
}
