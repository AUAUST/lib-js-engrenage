import { readFileSync } from "node:fs";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import { packageFile } from "#config/constants";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { SubpathImports } from "#typescript/types/SubpathImports";

export function readSubpathImports(root: Directory | URL): SubpathImports {
  const packageJsonPath = resolve(root, packageFile);

  const packageJson: unknown = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  );

  if (!isPlainObject(packageJson) || !isPlainObject(packageJson.imports)) {
    throw new Error(`${packageJsonPath} declares no subpath imports`);
  }

  return packageJson.imports;
}
