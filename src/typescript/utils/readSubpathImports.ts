import type { SubpathImports } from "#typescript/types/SubpathImports";
import type { Directory } from "#types/Directory";
import { resolvePath } from "#utils/resolvePath";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { readFileSync } from "node:fs";

export function readSubpathImports(root: Directory | URL): SubpathImports {
  const packageJsonPath = resolvePath(root, "package.json");

  const packageJson: unknown = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  );

  if (!isPlainObject(packageJson) || !isPlainObject(packageJson.imports)) {
    throw new Error(`${packageJsonPath} declares no subpath imports`);
  }

  return packageJson.imports;
}
