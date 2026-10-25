import { resolve as nodeResolve } from "node:path";
import { fileURLToPath } from "node:url";

import { isString } from "@auaust/toolkit/isString";

import type { Directory } from "#types/Directory";

export function resolve(base: Directory | URL, ...paths: string[]): string {
  const basePath = isString(base) ? base : fileURLToPath(base);

  return nodeResolve(basePath, ...paths);
}
