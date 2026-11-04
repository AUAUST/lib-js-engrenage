import { findIndex, findLastIndex } from "@auaust/primitive-kit/arrays";

import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { packageJsonPropertyOrder } from "#project/package/constants";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { File } from "#types/File";

function rankOf(property: string): number {
  return findIndex(packageJsonPropertyOrder, (known) => known === property);
}

function propertyInsertionIndex(
  property: string,
  properties: string[],
): number {
  const rank = rankOf(property);

  if (rank === -1) {
    return properties.length;
  }

  const preceding = findLastIndex(properties, (existing) => {
    const existingRank = rankOf(existing);

    return existingRank !== -1 && existingRank < rank;
  });

  return preceding + 1;
}

function collectionInsertionIndex(key: string, properties: string[]): number {
  const following = findIndex(properties, (existing) => existing > key);

  return following === -1 ? properties.length : following;
}

export function writePackageJsonValue(
  content: string,
  path: File,
  location: readonly [string] | readonly [string, string],
  value: JsonValue,
): string {
  const [property, key] = location;

  if (key === undefined || readJsonValue(content, path, [property]) == null) {
    return writeJsonValue(
      content,
      path,
      [property],
      key === undefined
        ? value
        : {
            [key]: value,
          },
      {
        getInsertionIndex(properties) {
          return propertyInsertionIndex(property, properties);
        },
      },
    );
  }

  return writeJsonValue(content, path, [property, key], value, {
    getInsertionIndex(properties) {
      return collectionInsertionIndex(key, properties);
    },
  });
}
