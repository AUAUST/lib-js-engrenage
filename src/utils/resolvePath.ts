import type { Directory } from "#types/Directory";
import { isString } from "@auaust/toolkit/isString";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function resolvePath(base: Directory | URL, ...paths: string[]): string {
  const basePath = isString(base) ? base : fileURLToPath(base);

  return resolve(basePath, ...paths);
}
