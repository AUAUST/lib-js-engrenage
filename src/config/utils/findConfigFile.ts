import { existsSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";
import { SUPPORTED_EXTENSIONS } from "c12";

import { configFileName } from "#config/constants";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function findConfigFile(root: Directory): File | null {
  const candidates = map(SUPPORTED_EXTENSIONS, (extension) => {
    return resolve(root, `${configFileName}${extension}`);
  });

  const [configFile = null, ...others] = candidates.filter((candidate) => {
    return existsSync(candidate);
  });

  if (others.length > 0) {
    throw new Error(
      `Found several engrenage config files in ${root}: ${[configFile, ...others].join(", ")}`,
    );
  }

  return configFile;
}
