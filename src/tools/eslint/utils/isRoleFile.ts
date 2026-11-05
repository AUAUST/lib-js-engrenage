import { basename, dirname, matchesGlob } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { StructureLocation } from "#tools/eslint/types/StructureLocation";

export function isRoleFile(
  config: ConventionConfig,
  { environment, relativePath }: StructureLocation,
): boolean {
  const globs = flatMap(values(config[environment].roles.roles), ({ file }) => {
    return file === undefined ? [] : [file].flat();
  });

  return (
    dirname(relativePath) === "." &&
    globs.some((glob) => matchesGlob(basename(relativePath), glob))
  );
}
