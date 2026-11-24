import satisfies from "semver/functions/satisfies.js";
import validRange from "semver/ranges/valid.js";

import { flatMap, isNonEmptyArray } from "@auaust/toolkit/array";

import type { Extension } from "#project/config/types/Extension";

import manifest from "#package.json" with { type: "json" };

export function checkCompatibility(extensions: readonly Extension[]): void {
  const findings = flatMap(extensions, ({ name, compatibility }) => {
    if (compatibility === undefined) {
      return [];
    }

    const range = compatibility.engrenage;

    if (validRange(range) === null) {
      return [`${name} declares the invalid engrenage range "${range}"`];
    }

    return satisfies(manifest.version, range, {
      includePrerelease: true,
    })
      ? []
      : [
          `${name} requires engrenage ${range}, but ${manifest.version} is installed`,
        ];
  });

  if (isNonEmptyArray(findings)) {
    throw new Error(`Incompatible extensions:\n${findings.join("\n")}`);
  }
}
