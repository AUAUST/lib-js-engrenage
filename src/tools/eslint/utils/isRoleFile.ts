import { basename, dirname, matchesGlob } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import type { ProjectConfig } from "#project/config/index";
import type { StructureLocation } from "#tools/eslint/types/StructureLocation";

export function isRoleFile(
  config: ProjectConfig,
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
