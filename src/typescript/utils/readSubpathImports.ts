import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { SubpathImports } from "#typescript/types/SubpathImports";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { readFileSync } from "node:fs";

export function readSubpathImports(root: Directory | URL): SubpathImports {
  const packageJsonPath = resolve(root, "package.json");

  const packageJson: unknown = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  );

  if (!isPlainObject(packageJson) || !isPlainObject(packageJson.imports)) {
    throw new Error(`${packageJsonPath} declares no subpath imports`);
  }

  return packageJson.imports;
}
