import { createRequire } from "node:module";

import type { format, getFileInfo, resolveConfig } from "prettier";

import { get } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { resolve } from "#foundation/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";

interface Prettier {
  format: typeof format;
  getFileInfo: typeof getFileInfo;
  resolveConfig: typeof resolveConfig;
}

export function loadPrettier(root: Directory): Prettier | undefined {
  try {
    return createRequire(resolve(root, packageJsonFile))("prettier");
  } catch (error) {
    if (get(error, "code") === "MODULE_NOT_FOUND") {
      return;
    }

    throw error;
  }
}
